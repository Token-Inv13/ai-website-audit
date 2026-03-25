import { ImageResponse } from "next/og"

import { BRAND_NAME, DEFAULT_SEO_DESCRIPTION } from "@/lib/branding"

export const alt = "SEOAuditAI"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 16% 14%, rgba(96,165,250,0.32), transparent 32%), radial-gradient(circle at 88% 10%, rgba(34,211,238,0.24), transparent 26%), linear-gradient(180deg, #f8fbff 0%, #eef6ff 52%, #f8fafc 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 36,
            borderRadius: 36,
            border: "1px solid rgba(255,255,255,0.82)",
            background: "rgba(255,255,255,0.7)",
            boxShadow: "0 28px 80px -46px rgba(15,23,42,0.34)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "76px 84px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div
              style={{
                display: "flex",
                position: "relative",
                width: 108,
                height: 108,
                borderRadius: 30,
                background: "linear-gradient(180deg, #2563eb 0%, #0891b2 100%)",
                boxShadow: "0 24px 50px -30px rgba(37,99,235,0.82)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 28,
                  bottom: 28,
                  width: 12,
                  height: 22,
                  borderRadius: 999,
                  background: "#fff",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 47,
                  bottom: 28,
                  width: 12,
                  height: 34,
                  borderRadius: 999,
                  background: "#fff",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 66,
                  bottom: 28,
                  width: 12,
                  height: 48,
                  borderRadius: 999,
                  background: "#fff",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 28,
                  top: 54,
                  width: 54,
                  height: 12,
                  borderRadius: 999,
                  background: "#fff",
                  transform: "rotate(-36deg)",
                  transformOrigin: "left center",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 66,
                  top: 44,
                  width: 24,
                  height: 12,
                  borderRadius: 999,
                  background: "#fff",
                  transform: "rotate(18deg)",
                  transformOrigin: "left center",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 18,
                  top: 18,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#fff",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 58,
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                }}
              >
                <span>SEOAudit</span>
                <span style={{ color: "#0284c7" }}>AI</span>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#0369a1",
                }}
              >
                AI SEO, UX & Conversion Audits
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              maxWidth: 860,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 62,
                lineHeight: 1.05,
                fontWeight: 750,
                letterSpacing: "-0.05em",
              }}
            >
              Analyze your website and surface the SEO, UX and conversion fixes that matter.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.35,
                color: "#334155",
              }}
            >
              {DEFAULT_SEO_DESCRIPTION}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              color: "#475569",
            }}
          >
            <div style={{ display: "flex" }}>{BRAND_NAME}</div>
            <div style={{ display: "flex", color: "#0f172a", fontWeight: 700 }}>
              seoauditai.io
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
