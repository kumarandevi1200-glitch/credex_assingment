import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const savings = searchParams.get('savings');

    // Make sure we have a number
    const displaySavings = savings ? parseInt(savings).toLocaleString() : '0';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0A0A10', // var(--color-ink)
            backgroundImage: 'radial-gradient(circle at top left, rgba(0, 229, 160, 0.2) 0%, transparent 40%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.2) 0%, transparent 40%)',
            fontFamily: 'sans-serif',
            color: '#FAFAFA', // var(--color-paper)
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 32, letterSpacing: '0.1em', color: '#00E5A0', marginBottom: 20, textTransform: 'uppercase' }}>
              SpendLens Audit Complete
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
              <div style={{ fontSize: 40, color: 'rgba(250, 250, 250, 0.6)', marginBottom: 20 }}>
                MONTHLY SAVINGS IDENTIFIED
              </div>
              <div style={{ fontSize: 140, fontWeight: 700, color: '#FAFAFA', lineHeight: 1 }}>
                ${displaySavings}
              </div>
            </div>
            
            <div style={{ display: 'flex', marginTop: 80, fontSize: 24, color: 'rgba(250, 250, 250, 0.5)' }}>
              credex.rocks/spendlens
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
