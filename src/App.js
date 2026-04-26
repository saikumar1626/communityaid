import React, { useState } from 'react';

const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY;

export default function App() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('English');

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const diagnose = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setResult(null);
    try {
      const prompt = `You are an expert agricultural scientist. Analyze this crop photo and respond in ${lang}.
Return ONLY this JSON format, nothing else:
{
  "disease": "disease name or Healthy",
  "severity": "High / Medium / Low / None",
  "cause": "one sentence cause",
  "organic_treatment": "one clear organic treatment",
  "chemical_treatment": "one clear chemical treatment",
  "prevention": "one prevention tip"
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
              ]
            }]
          })
        }
      );
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      const clean = text.replace(/```json|```/g, '').trim();
      setResult(JSON.parse(clean));
    } catch (err) {
      setResult({ error: 'Something went wrong. Check your API key or image.' });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0faf4', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#1a7a4a', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28 }}>🌿</span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>AgroMind</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>AI Crop Disease Detector</div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '32px auto', padding: '0 16px' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>Language / భాష</label>
            <select value={lang} onChange={e => setLang(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: '100%' }}>
              <option>English</option>
              <option>Telugu</option>
              <option>Hindi</option>
              <option>Tamil</option>
            </select>
          </div>

          <label style={{
            display: 'block', border: '2px dashed #1a7a4a', borderRadius: 12,
            padding: 32, textAlign: 'center', cursor: 'pointer', background: '#f8fff9'
          }}>
            <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            {image
              ? <img src={image} alt="crop" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8 }} />
              : <div>
                  <div style={{ fontSize: 40 }}>📷</div>
                  <div style={{ fontSize: 14, color: '#1a7a4a', fontWeight: 600, marginTop: 8 }}>Tap to upload crop photo</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>JPG, PNG supported</div>
                </div>
            }
          </label>

          <button onClick={diagnose} disabled={!imageBase64 || loading}
            style={{
              width: '100%', marginTop: 16, padding: '14px',
              background: imageBase64 ? '#1a7a4a' : '#ccc',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 16, fontWeight: 700, cursor: imageBase64 ? 'pointer' : 'not-allowed'
            }}>
            {loading ? '🔍 Analysing crop...' : '🌱 Diagnose My Crop'}
          </button>
        </div>

        {result && !result.error && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a7a4a' }}>{result.disease}</div>
              <span style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                background: result.severity === 'High' ? '#fee2e2' : result.severity === 'Medium' ? '#fef3c7' : '#dcfce7',
                color: result.severity === 'High' ? '#991b1b' : result.severity === 'Medium' ? '#92400e' : '#166534'
              }}>{result.severity} severity</span>
            </div>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>{result.cause}</p>
            {[
              { label: '🌿 Organic Treatment', value: result.organic_treatment, bg: '#f0fdf4', border: '#86efac' },
              { label: '💊 Chemical Treatment', value: result.chemical_treatment, bg: '#eff6ff', border: '#93c5fd' },
              { label: '🛡️ Prevention', value: result.prevention, bg: '#fefce8', border: '#fde047' }
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: '#333' }}>{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {result?.error && (
          <div style={{ background: '#fee2e2', borderRadius: 12, padding: 16, color: '#991b1b', fontSize: 14 }}>
            {result.error}
          </div>
        )}
      </div>
    </div>
  );
}