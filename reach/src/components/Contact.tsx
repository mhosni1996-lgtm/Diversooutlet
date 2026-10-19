import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { site } from '../content/site';
import { ArrowGlyph, StaticSculpture } from './Art';
import { RevealTitle } from './RevealTitle';

type Field = 'name' | 'phone' | 'company' | 'service' | 'brief';
type Values = Record<Field, string>;
type Status = { tone: 'info' | 'error' | 'success'; text: string } | null;

const EMPTY: Values = { name: '', phone: '', company: '', service: '', brief: '' };

/** Normalise Arabic-Indic and Persian digits to ASCII before validating. */
function normaliseDigits(v: string) {
  return v.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

function validate(field: Field, raw: string): string | null {
  const v = raw.trim();
  switch (field) {
    case 'name':
      return v.length < 2 ? 'من فضلك اكتب اسمك (حرفان على الأقل).' : null;
    case 'phone': {
      if (!v) return 'من فضلك أدخل رقم الهاتف.';
      const n = normaliseDigits(v);
      if (!/^\+?[\d\s\-()]+$/.test(n)) return 'رقم الهاتف يجب أن يحتوي على أرقام فقط، ويمكن أن يبدأ بـ +.';
      const digits = n.replace(/\D/g, '').length;
      return digits < 7 || digits > 15 ? 'تأكد من رقم الهاتف: بين 7 و15 رقماً.' : null;
    }
    case 'service':
      return v ? null : 'اختر الخدمة المطلوبة.';
    case 'brief':
      return v.length < 10 ? 'اكتب نبذة قصيرة عن مشروعك (10 أحرف على الأقل).' : null;
    default:
      return null;
  }
}

const FIELDS: Field[] = ['name', 'phone', 'company', 'service', 'brief'];

export function Contact({ preset }: { preset: { service: string; n: number } }) {
  const c = site.contact;
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);
  const connected = c.endpoint.trim().length > 0;

  useEffect(() => {
    if (preset.service) setValues((v) => ({ ...v, service: preset.service }));
  }, [preset]);

  const set = (f: Field, v: string) => {
    setValues((s) => ({ ...s, [f]: v }));
    if (attempted) setErrors((e) => ({ ...e, [f]: validate(f, v) ?? undefined }));
    setStatus(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    const next: Partial<Record<Field, string>> = {};
    FIELDS.forEach((f) => {
      const err = validate(f, values[f]);
      if (err) next[f] = err;
    });
    setErrors(next);
    const first = FIELDS.find((f) => next[f]);
    if (first) {
      setStatus({ tone: 'error', text: `يرجى مراجعة ${Object.keys(next).length === 1 ? 'الحقل المظلّل' : 'الحقول المظلّلة'} قبل الإرسال.` });
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    if (!connected) {
      // Never pretend: no backend means nothing was sent.
      setStatus({ tone: 'info', text: c.notConnected });
      return;
    }

    setSending(true);
    setStatus({ tone: 'info', text: c.sending });
    try {
      const res = await fetch(c.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...values, phone: normaliseDigits(values.phone) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus({ tone: 'success', text: c.success });
      setValues(EMPTY);
      setAttempted(false);
    } catch {
      setStatus({ tone: 'error', text: c.failure });
    } finally {
      setSending(false);
    }
  };

  const fieldProps = (f: Field) => ({
    id: `${uid}-${f}`,
    name: f,
    value: values[f],
    'aria-invalid': errors[f] ? (true as const) : undefined,
    'aria-describedby': errors[f] ? `${uid}-${f}-err` : undefined,
    onBlur: () => attempted && setErrors((e) => ({ ...e, [f]: validate(f, values[f]) ?? undefined })),
  });

  const err = (f: Field) =>
    errors[f] ? (
      <span className="field__error" id={`${uid}-${f}-err`}>
        {errors[f]}
      </span>
    ) : null;

  const details = Object.entries(c.details).filter(([, v]) => v);

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container contact__grid">
        <div>
          <span className="kicker">{c.kicker}</span>
          <RevealTitle id="contact-title" className="section-title contact__title" lines={c.titleLines} />
          <p className="lead" data-rise>{c.copy}</p>

          <form ref={formRef} className="form" noValidate onSubmit={onSubmit} aria-describedby={!connected ? `${uid}-notice` : undefined}>
            <div className="field">
              <label htmlFor={`${uid}-name`}>{c.fields.name}</label>
              <input {...fieldProps('name')} type="text" autoComplete="name" required onChange={(e) => set('name', e.target.value)} />
              {err('name')}
            </div>
            <div className="field">
              <label htmlFor={`${uid}-phone`}>{c.fields.phone}</label>
              <input
                {...fieldProps('phone')}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                style={{ textAlign: 'right' }}
                required
                onChange={(e) => set('phone', e.target.value)}
              />
              {err('phone')}
            </div>
            <div className="field">
              <label htmlFor={`${uid}-company`}>
                {c.fields.company} <span className="opt">(اختياري)</span>
              </label>
              <input {...fieldProps('company')} type="text" autoComplete="organization" onChange={(e) => set('company', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor={`${uid}-service`}>{c.fields.service}</label>
              <select {...fieldProps('service')} required onChange={(e) => set('service', e.target.value)}>
                <option value="">{c.servicePlaceholder}</option>
                {site.services.items.map((s) => (
                  <option key={s.id} value={s.title}>
                    {s.title}
                  </option>
                ))}
                {c.extraServiceOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {err('service')}
            </div>
            <div className="field field--full">
              <label htmlFor={`${uid}-brief`}>{c.fields.brief}</label>
              <textarea {...fieldProps('brief')} rows={5} required onChange={(e) => set('brief', e.target.value)} />
              {err('brief')}
            </div>

            <div className="form__actions">
              <button type="submit" className="btn btn--yellow" data-anchor="cta-button" disabled={sending} aria-disabled={sending}>
                {c.submit}
                <ArrowGlyph />
              </button>
              <span className="cta-arrow-slot" data-anchor="cta-arrow" aria-hidden="true" />
            </div>

            <div className="form__status" role="status" aria-live="polite" data-tone={status?.tone}>
              {status?.text}
            </div>

            {!connected && (
              <p className="form__notice" id={`${uid}-notice`}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="7" y="4" width="2" height="5" fill="currentColor" />
                  <rect x="7" y="10.5" width="2" height="2" fill="currentColor" />
                </svg>
                {c.previewNotice}
              </p>
            )}
          </form>

          {details.length > 0 && (
            <ul className="contact-details">
              {details.map(([k, v]) => (
                <li key={k}>{v}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="contact__stage" data-anchor="contact-stage">
          <StaticSculpture variant="contact" />
        </div>
      </div>
    </section>
  );
}
