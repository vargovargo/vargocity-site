export default function GratitudeOptInPage() {
  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '3rem 1.5rem',
      color: 'var(--c-text)',
      fontFamily: 'system-ui, sans-serif',
      lineHeight: '1.7',
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>
        Daily Gratitude SMS Program
      </h1>
      <p style={{ color: 'var(--c-text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
        Opt-in information for Twilio toll-free verification
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>What is this?</h2>
        <p>
          A private family SMS program that sends one daily gratitude prompt. This is not a public
          service — members are added directly by the program administrator after giving their
          consent. There is no public sign-up form.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>How opt-in works</h2>
        <p>
          Participants are enrolled by the family administrator after giving explicit verbal consent.
          No one is added without asking first.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Verbal consent script</h2>
        <p style={{ marginBottom: '0.75rem' }}>
          The administrator uses the following language when asking for consent:
        </p>
        <blockquote style={{
          borderLeft: '3px solid var(--c-border)',
          paddingLeft: '1rem',
          margin: '0 0 0.75rem 0',
          color: 'var(--c-text-body)',
          fontStyle: 'italic',
        }}>
          "Hey [name], I set up a little SMS program that sends a daily gratitude question — just one
          text a day in the morning. Would you like me to add your number so you get it too?"
        </blockquote>
        <p>
          The participant must affirmatively say yes before being enrolled. If they say yes, the
          administrator records their name, phone number, and date of consent, then adds them to the
          program. A confirmation text is sent to the participant immediately upon enrollment.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Confirmation message</h2>
        <p style={{ marginBottom: '0.75rem' }}>
          After enrollment, participants receive a confirmation text similar to:
        </p>
        <blockquote style={{
          borderLeft: '3px solid var(--c-border)',
          paddingLeft: '1rem',
          margin: '0',
          color: 'var(--c-text-body)',
          fontStyle: 'italic',
        }}>
          "You're signed up for the Daily Gratitude SMS program! You'll get one morning prompt each
          day. Reply STOP anytime to unsubscribe, or HELP for assistance. Message &amp; data rates may apply."
        </blockquote>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>How consent is recorded</h2>
        <p>
          The administrator maintains a private log of each participant's name, phone number, and
          date verbal consent was obtained. This record is retained for the duration of their
          participation in the program.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Message frequency</h2>
        <p>
          1–2 messages per day: a morning gratitude prompt, and occasionally a short evening
          reminder. Message and data rates may apply.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>How to opt out</h2>
        <p>
          Reply <strong>STOP</strong> at any time to unsubscribe immediately. Reply <strong>HELP</strong> for
          assistance. You can also contact the administrator directly to be removed.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Privacy</h2>
        <p>
          Phone numbers and any responses are never sold, shared, or used for any purpose outside
          this program. All data is stored privately and accessible only to the program administrator.
        </p>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--c-border)', margin: '2rem 0' }} />
      <p style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>
        This page exists to satisfy carrier verification requirements for toll-free SMS messaging.
        Questions? Contact the administrator directly.
      </p>
    </div>
  )
}
