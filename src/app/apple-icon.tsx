import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#4f46e5',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 108,
            fontWeight: 700,
            fontFamily: 'system-ui, sans-serif',
            lineHeight: 1,
            transform: 'translateY(-6px)',
          }}
        >
          e
        </div>
      </div>
    ),
    { ...size },
  );
}
