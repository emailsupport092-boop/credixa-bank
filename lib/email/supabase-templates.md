# Supabase Email Templates — Credixa Bank

Paste each block into: Supabase Dashboard → Authentication → Email Templates

---

## 1. Confirm Signup

**Subject:** `Confirm your Credixa Bank account`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0066cc,#003d99);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                <tr>
                  <td style="background:rgba(255,255,255,0.2);border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                    <span style="color:white;font-size:22px;font-weight:900;line-height:44px;">C</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="color:white;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Credixa Bank</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(255,255,255,0.75);margin:16px 0 0;font-size:14px;letter-spacing:0.5px;">SECURE DIGITAL BANKING</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">

              <!-- Icon -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#eff6ff;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✉️</div>
              </div>

              <h2 style="color:#0f172a;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">Verify your email address</h2>
              <p style="color:#64748b;font-size:15px;text-align:center;margin:0 0 32px;line-height:1.6;">
                You're almost there! Click the button below to confirm your email and activate your Credixa Bank account.
              </p>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="{{ .ConfirmationURL }}"
                   style="display:inline-block;background:linear-gradient(135deg,#0066cc,#004499);color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
                  Confirm Email Address
                </a>
              </div>

              <!-- Security note -->
              <div style="background:#f8fafc;border-left:4px solid #0066cc;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#374151;font-size:13px;line-height:1.5;">
                  🔒 <strong>This link expires in 24 hours.</strong> If you didn't create a Credixa Bank account, you can safely ignore this email.
                </p>
              </div>

              <!-- Alt link -->
              <p style="color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;margin:0;">
                Button not working? Copy and paste this link into your browser:<br/>
                <a href="{{ .ConfirmationURL }}" style="color:#0066cc;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 16px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
                © 2025 Credixa Bank. All rights reserved.<br/>
                This is an automated message — please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset Password

**Subject:** `Reset your Credixa Bank password`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0066cc,#003d99);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                <tr>
                  <td style="background:rgba(255,255,255,0.2);border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                    <span style="color:white;font-size:22px;font-weight:900;line-height:44px;">C</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="color:white;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Credixa Bank</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(255,255,255,0.75);margin:16px 0 0;font-size:14px;letter-spacing:0.5px;">SECURE DIGITAL BANKING</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">

              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#fff7ed;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">🔐</div>
              </div>

              <h2 style="color:#0f172a;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">Password Reset Request</h2>
              <p style="color:#64748b;font-size:15px;text-align:center;margin:0 0 32px;line-height:1.6;">
                We received a request to reset the password for your Credixa Bank account. Click the button below to choose a new password.
              </p>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="{{ .ConfirmationURL }}"
                   style="display:inline-block;background:linear-gradient(135deg,#0066cc,#004499);color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
                  Reset My Password
                </a>
              </div>

              <!-- Expiry -->
              <div style="background:#fff7ed;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                  ⏱ <strong>This link expires in 1 hour.</strong> After that, you'll need to request a new password reset.
                </p>
              </div>

              <!-- Warning -->
              <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.5;">
                  🚨 <strong>Didn't request this?</strong> Your password has not been changed. You can safely ignore this email — but if you're concerned, consider changing your password as a precaution.
                </p>
              </div>

              <p style="color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;margin:0;">
                Button not working? Copy and paste this link:<br/>
                <a href="{{ .ConfirmationURL }}" style="color:#0066cc;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 16px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
                © 2025 Credixa Bank. All rights reserved.<br/>
                This is an automated message — please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Magic Link

**Subject:** `Your Credixa Bank sign-in link`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0066cc,#003d99);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                <tr>
                  <td style="background:rgba(255,255,255,0.2);border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                    <span style="color:white;font-size:22px;font-weight:900;line-height:44px;">C</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="color:white;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Credixa Bank</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(255,255,255,0.75);margin:16px 0 0;font-size:14px;letter-spacing:0.5px;">SECURE DIGITAL BANKING</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">

              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#eff6ff;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">⚡</div>
              </div>

              <h2 style="color:#0f172a;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">Your sign-in link</h2>
              <p style="color:#64748b;font-size:15px;text-align:center;margin:0 0 32px;line-height:1.6;">
                Click the button below to sign in to your Credixa Bank account instantly — no password needed.
              </p>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="{{ .ConfirmationURL }}"
                   style="display:inline-block;background:linear-gradient(135deg,#0066cc,#004499);color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
                  Sign In to Credixa Bank
                </a>
              </div>

              <div style="background:#f8fafc;border-left:4px solid #0066cc;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;color:#374151;font-size:13px;line-height:1.5;">
                  🔒 <strong>This link expires in 1 hour</strong> and can only be used once. Never share this link with anyone.
                </p>
              </div>

              <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.5;">
                  🚨 <strong>Didn't request this?</strong> Someone may have entered your email address by mistake. You can safely ignore this email.
                </p>
              </div>

              <p style="color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;margin:0;">
                Button not working? Copy and paste this link:<br/>
                <a href="{{ .ConfirmationURL }}" style="color:#0066cc;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 16px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
                © 2025 Credixa Bank. All rights reserved.<br/>
                This is an automated message — please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Change Email Address

**Subject:** `Confirm your new Credixa Bank email address`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0066cc,#003d99);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                <tr>
                  <td style="background:rgba(255,255,255,0.2);border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                    <span style="color:white;font-size:22px;font-weight:900;line-height:44px;">C</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="color:white;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Credixa Bank</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(255,255,255,0.75);margin:16px 0 0;font-size:14px;letter-spacing:0.5px;">SECURE DIGITAL BANKING</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">

              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#f0fdf4;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">📧</div>
              </div>

              <h2 style="color:#0f172a;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">Confirm your new email</h2>
              <p style="color:#64748b;font-size:15px;text-align:center;margin:0 0 24px;line-height:1.6;">
                You requested to update the email address on your Credixa Bank account. Click below to confirm the change.
              </p>

              <!-- New email display -->
              <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;text-align:center;margin-bottom:28px;border:1px solid #e5e7eb;">
                <p style="margin:0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">New email address</p>
                <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">{{ .Email }}</p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="{{ .ConfirmationURL }}"
                   style="display:inline-block;background:linear-gradient(135deg,#0066cc,#004499);color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
                  Confirm New Email
                </a>
              </div>

              <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.5;">
                  🚨 <strong>Didn't request this change?</strong> Someone may have access to your account. Please <a href="{{ .SiteURL }}/forgot-password" style="color:#0066cc;">reset your password</a> immediately.
                </p>
              </div>

              <p style="color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;margin:0;">
                Button not working? Copy and paste this link:<br/>
                <a href="{{ .ConfirmationURL }}" style="color:#0066cc;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 16px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
                © 2025 Credixa Bank. All rights reserved.<br/>
                This is an automated message — please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. Invite User

**Subject:** `You've been invited to Credixa Bank`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0066cc,#003d99);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                <tr>
                  <td style="background:rgba(255,255,255,0.2);border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                    <span style="color:white;font-size:22px;font-weight:900;line-height:44px;">C</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="color:white;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Credixa Bank</span>
                  </td>
                </tr>
              </table>
              <p style="color:rgba(255,255,255,0.75);margin:16px 0 0;font-size:14px;letter-spacing:0.5px;">SECURE DIGITAL BANKING</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">

              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#faf5ff;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">🎉</div>
              </div>

              <h2 style="color:#0f172a;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">You're invited!</h2>
              <p style="color:#64748b;font-size:15px;text-align:center;margin:0 0 32px;line-height:1.6;">
                You've been invited to join <strong>Credixa Bank</strong> — secure digital banking with instant transfers, smart loans, and real-time insights.
              </p>

              <!-- Features -->
              <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:28px;border:1px solid #e5e7eb;">
                <p style="margin:0 0 12px;color:#374151;font-size:14px;font-weight:600;">What you get with Credixa Bank:</p>
                <table cellpadding="0" cellspacing="0" style="width:100%;">
                  <tr><td style="padding:5px 0;color:#64748b;font-size:13px;">✅ &nbsp;Instant money transfers</td></tr>
                  <tr><td style="padding:5px 0;color:#64748b;font-size:13px;">✅ &nbsp;Multi-currency accounts</td></tr>
                  <tr><td style="padding:5px 0;color:#64748b;font-size:13px;">✅ &nbsp;Smart loan calculator &amp; applications</td></tr>
                  <tr><td style="padding:5px 0;color:#64748b;font-size:13px;">✅ &nbsp;Real-time crypto price tracking</td></tr>
                  <tr><td style="padding:5px 0;color:#64748b;font-size:13px;">✅ &nbsp;Two-factor authentication security</td></tr>
                </table>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="{{ .ConfirmationURL }}"
                   style="display:inline-block;background:linear-gradient(135deg,#0066cc,#004499);color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
                  Accept Invitation
                </a>
              </div>

              <div style="background:#f8fafc;border-left:4px solid #0066cc;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#374151;font-size:13px;line-height:1.5;">
                  🔒 <strong>This invitation expires in 24 hours.</strong> If you weren't expecting this invite, you can safely ignore this email.
                </p>
              </div>

              <p style="color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;margin:0;">
                Button not working? Copy and paste this link:<br/>
                <a href="{{ .ConfirmationURL }}" style="color:#0066cc;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 16px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
                © 2025 Credixa Bank. All rights reserved.<br/>
                This is an automated message — please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```
