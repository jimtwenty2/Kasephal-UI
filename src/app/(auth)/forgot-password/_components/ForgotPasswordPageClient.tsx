"use client";
import Image from "next/image";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useI18n } from "@/lib/i18n/I18nContext";
import { createTranslator } from "../../login/LoginFlow";
export const FORGOT_PASSWORD_TEXT = {
  /* ===========================
   * Hero
   * =========================== */
  "forgotPassword.hero.title1": {
    en: "Secure",
    kh: "ការស្ដារ",
  },
  "forgotPassword.hero.title2": {
    en: "Account",
    kh: "គណនី",
  },
  "forgotPassword.hero.title3": {
    en: "Recovery",
    kh: "ដោយសុវត្ថិភាព",
  },
  "forgotPassword.hero.description": {
    en: "Let's get you back in. Quickly and securely reset your password to stay connected with Cambodia's trusted agricultural network.",
    kh: "តោះចូលគណនីរបស់អ្នកវិញ។ កំណត់ពាក្យសម្ងាត់ឡើងវិញយ៉ាងរហ័ស និងមានសុវត្ថិភាព ដើម្បីបន្តភ្ជាប់ជាមួយបណ្ដាញកសិកម្មដែលអាចទុកចិត្តបានរបស់កម្ពុជា។",
  },

  /* ===========================
   * Common
   * =========================== */
  "forgotPassword.common.back": {
    en: "Back",
    kh: "ត្រឡប់ក្រោយ",
  },
  "forgotPassword.common.tryAnotherWay": {
    en: "Try another way",
    kh: "សាកល្បងវិធីផ្សេង",
  },
  "forgotPassword.common.sendCode": {
    en: "SEND CODE",
    kh: "ផ្ញើលេខកូដ",
  },
  "forgotPassword.common.sending": {
    en: "SENDING...",
    kh: "កំពុងផ្ញើ...",
  },
  "forgotPassword.common.email": {
    en: "Email",
    kh: "អ៊ីមែល",
  },
  "forgotPassword.common.phoneNumber": {
    en: "Phone Number",
    kh: "លេខទូរស័ព្ទ",
  },
  "forgotPassword.common.emailPlaceholder": {
    en: "Enter email",
    kh: "បញ្ចូលអ៊ីមែល",
  },
  "forgotPassword.common.phonePlaceholder": {
    en: "--- --- ---",
    kh: "--- --- ---",
  },

  /* ===========================
   * Toasts
   * =========================== */
  "forgotPassword.toast.sendCodeFailed": {
    en: "Send Code Failed",
    kh: "ការផ្ញើលេខកូដបរាជ័យ",
  },
  "forgotPassword.toast.forgotPasswordFailed": {
    en: "Forgot Password Failed",
    kh: "ការស្នើសុំកំណត់ពាក្យសម្ងាត់ឡើងវិញបរាជ័យ",
  },
  "forgotPassword.toast.otpSent": {
    en: "OTP Sent Successfully",
    kh: "បានផ្ញើលេខកូដ OTP ដោយជោគជ័យ",
  },
  "forgotPassword.toast.verificationSent": {
    en: "Your verification code has been sent to",
    kh: "លេខកូដផ្ទៀងផ្ទាត់របស់អ្នកត្រូវបានផ្ញើទៅកាន់",
  },

  /* ===========================
   * Email Recovery
   * =========================== */
  "forgotPassword.email.title": {
    en: "Forgot Password",
    kh: "ភ្លេចពាក្យសម្ងាត់",
  },
  "forgotPassword.email.description": {
    en: "Please enter your registered email below to receive a secure password reset code.",
    kh: "សូមបញ្ចូលអ៊ីមែលដែលបានចុះឈ្មោះរបស់អ្នក ដើម្បីទទួលលេខកូដសុវត្ថិភាពសម្រាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញ។",
  },

  /* ===========================
   * Phone Method
   * =========================== */
  "forgotPassword.phoneMethod.title": {
    en: "Use a phone number from your account",
    kh: "ប្រើលេខទូរស័ព្ទដែលភ្ជាប់ជាមួយគណនីរបស់អ្នក",
  },
  "forgotPassword.phoneMethod.description": {
    en: "We will send a verification code to a phone number on your account.",
    kh: "យើងនឹងផ្ញើលេខកូដផ្ទៀងផ្ទាត់ទៅកាន់លេខទូរស័ព្ទដែលភ្ជាប់ជាមួយគណនីរបស់អ្នក។",
  },
  "forgotPassword.phoneMethod.chooseMethod": {
    en: "Choose how you want to sign in:",
    kh: "ជ្រើសរើសវិធីដែលអ្នកចង់ចូលគណនី៖",
  },
  "forgotPassword.phoneMethod.tryAnotherWayToSignIn": {
    en: "Try another way to sign in",
    kh: "សាកល្បងវិធីផ្សេងដើម្បីចូលគណនី",
  },

  /* ===========================
   * Account Recovery
   * =========================== */
  "forgotPassword.accountRecovery.title": {
    en: "Account Recovery",
    kh: "ការស្ដារគណនី",
  },
  "forgotPassword.accountRecovery.description": {
    en: "Confirm the phone number you provided in your security settings:",
    kh: "សូមបញ្ជាក់លេខទូរស័ព្ទដែលអ្នកបានផ្ដល់នៅក្នុងការកំណត់សុវត្ថិភាពរបស់អ្នក៖",
  },

  /* ===========================
   * OTP Verification
   * =========================== */
  "forgotPassword.otp.title": {
    en: "OTP Verification",
    kh: "ការផ្ទៀងផ្ទាត់ OTP",
  },

  "forgotPassword.otp.description": {
    en: "Enter the 6-digit code sent to",
    kh: "បញ្ចូលលេខកូដ 6 ខ្ទង់ដែលបានផ្ញើទៅកាន់",
  },

  "forgotPassword.otp.verifyCode": {
    en: "VERIFY CODE",
    kh: "ផ្ទៀងផ្ទាត់លេខកូដ",
  },

  "forgotPassword.otp.verifying": {
    en: "VERIFYING...",
    kh: "កំពុងផ្ទៀងផ្ទាត់...",
  },

  "forgotPassword.otp.resendIn": {
    en: "Resend in",
    kh: "ផ្ញើម្ដងទៀតក្នុង",
  },

  "forgotPassword.otp.didNotReceive": {
    en: "Did not receive a code?",
    kh: "មិនទទួលបានលេខកូដទេ?",
  },

  "forgotPassword.otp.resendCode": {
    en: "Resend Code",
    kh: "ផ្ញើលេខកូដម្ដងទៀត",
  },

  "forgotPassword.otp.successTitle": {
    en: "OTP verified",
    kh: "បានផ្ទៀងផ្ទាត់ OTP ដោយជោគជ័យ",
  },

  "forgotPassword.otp.successMessage": {
    en: "OTP verified successfully.",
    kh: "បានផ្ទៀងផ្ទាត់ OTP ដោយជោគជ័យ។",
  },

  "forgotPassword.otp.failedTitle": {
    en: "OTP verification failed",
    kh: "ការផ្ទៀងផ្ទាត់ OTP បរាជ័យ",
  },

  "forgotPassword.otp.resendFailedTitle": {
    en: "OTP resend failed",
    kh: "ការផ្ញើ OTP ម្ដងទៀតបរាជ័យ",
  },

  "forgotPassword.otp.resendSuccessTitle": {
    en: "OTP sent successfully",
    kh: "បានផ្ញើ OTP ដោយជោគជ័យ",
  },

  "forgotPassword.otp.resendSuccessMessage": {
    en: "Your verification code has been sent to",
    kh: "លេខកូដផ្ទៀងផ្ទាត់របស់អ្នកត្រូវបានផ្ញើទៅកាន់",
  },

  /* ===========================
   * Set New Password
   * =========================== */
  "forgotPassword.password.title": {
    en: "Set New Password",
    kh: "កំណត់ពាក្យសម្ងាត់ថ្មី",
  },

  "forgotPassword.password.newPassword": {
    en: "New Password",
    kh: "ពាក្យសម្ងាត់ថ្មី",
  },

  "forgotPassword.password.confirmPassword": {
    en: "Confirm Password",
    kh: "បញ្ជាក់ពាក្យសម្ងាត់",
  },

  "forgotPassword.password.newPasswordPlaceholder": {
    en: "Enter new password",
    kh: "បញ្ចូលពាក្យសម្ងាត់ថ្មី",
  },

  "forgotPassword.password.confirmPasswordPlaceholder": {
    en: "Confirm new password",
    kh: "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី",
  },

  "forgotPassword.password.updatePassword": {
    en: "UPDATE PASSWORD",
    kh: "ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់",
  },

  "forgotPassword.password.toast.failedTitle": {
    en: "Password Reset Failed",
    kh: "ការកំណត់ពាក្យសម្ងាត់បរាជ័យ",
  },

  "forgotPassword.password.toast.successTitle": {
    en: "Password Updated",
    kh: "បានធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់",
  },

  "forgotPassword.password.toast.successMessage": {
    en: "Your password has been updated successfully.",
    kh: "ពាក្យសម្ងាត់របស់អ្នកត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ។",
  },

  /* ===========================
   * Footer
   * =========================== */
  "forgotPassword.footer.copyright": {
    en: "© 2026 Kasephal. All rights reserved. Built with pride in Cambodia.",
    kh: "© ២០២៦ កសិផល។ រក្សាសិទ្ធិគ្រប់យ៉ាង។ បង្កើតឡើងដោយមោទនភាពនៅកម្ពុជា។",
  },
  "forgotPassword.footer.links": {
    en: "Privacy Policy | Terms of Service | Trust & Safety",
    kh: "គោលការណ៍ឯកជនភាព | លក្ខខណ្ឌនៃសេវាកម្ម | ទំនុកចិត្ត និងសុវត្ថិភាព",
  },
} as const;

export default function ForgotPasswordPageClient() {
  const { language } = useI18n();
  const t = createTranslator(FORGOT_PASSWORD_TEXT, language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  return (
    <div>
      <main
        className={`h-screen w-screen overflow-hidden bg-white font-medium ${fontClass}`}
      >
        <section className="relative flex h-full w-full flex-col overflow-hidden bg-white lg:flex-row p-5">
          <Image
            src="/assets/srov.png"
            width={220}
            height={253}
            alt="srov"
            className="absolute right-0 top-[3%] z-10 h-auto max-h-[25%] w-[clamp(100px,10vw,210px)] object-contain opacity-50"
          />

          <Image
            src="/assets/tractor.png"
            width={300}
            height={400}
            alt="tractor"
            className="absolute bottom-0 right-[3%] h-auto max-h-[30%] w-[clamp(130px,12vw,250px)] object-contain z-10"
          />

          <div className="absolute right-[-8%] top-[-3%] z-7 h-[clamp(220px,20vw,360px)] w-[clamp(170px,15vw,260px)] rounded-full bg-background blur-2xl" />

          <section className="relative hidden overflow-hidden rounded-[clamp(16px,1.2vw,24px)] bg-background lg:flex lg:h-full lg:w-[33%] lg:flex-col ">
            <div className="relative z-20 p-5 lg:p-[clamp(20px,4.2vw,78px)]">
              <Image
                src="/assets/logo-green.png"
                width={150}
                height={60}
                alt="logo-kasephal"
                className="h-auto w-[clamp(110px,8.7vw,150px)]"
              />

              <div className="mt-[clamp(28px,3vw,60px)] max-w-[clamp(500px,38vw,650px)] h-full ">
                <div className="relative text-[clamp(34px,3.1vw,58px)] font-extrabold leading-[1.15]">
                  <h1 className="text-primary-heading ">
                    {t("forgotPassword.hero.title1")}{" "}
                    <span className="text-primary">
                      {t("forgotPassword.hero.title2")}{" "}
                    </span>{" "}
                  </h1>
                  <h1 className="text-primary">
                    {" "}
                    {t("forgotPassword.hero.title3")}
                  </h1>
                </div>

                <p className="mt-[clamp(12px,1vw,22px)] max-w-[clamp(420px,29vw,520px)] font-description text-[clamp(13px,0.95vw,17px)] leading-[1.4] text-description-text ">
                  {t("forgotPassword.hero.description")}
                </p>
              </div>
            </div>
            <div className="w-full h-full  absolute   top-[50%] ]">
              <Image
                src="/assets/preview.png"
                width={1300}
                height={953}
                alt="preview"
                priority
                className="object-cover absolute right-[-25%] "
              />
            </div>

            <Image
              src="/assets/srov2.png"
              width={250}
              height={380}
              alt="srov2"
              className="absolute bottom-0 left-0 z-10 h-auto max-h-[45%] w-[clamp(150px,13vw,250px)] object-contain"
            />
          </section>

          <section className="relative flex h-full w-full  justify-center overflow-hidden  px-5 py-6 sm:px-8 lg:w-[65%] lg:px-[clamp(32px,4.2vw,82px)] lg:py-10">
            <section className="relative z-20 w-full max-w-[clamp(380px,34vw,560px)] ">
              <ForgotPasswordForm language={language} />
            </section>

            <footer className="absolute bottom-0 left-0 right-0 px-4 text-center text-[10px] font-description text-description-text sm:text-[11px] lg:text-[13px]">
              <p>{t("forgotPassword.footer.copyright")}</p>
              <p>{t("forgotPassword.footer.links")}</p>
            </footer>
          </section>
        </section>
      </main>
    </div>
  );
}
