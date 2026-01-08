import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FileText, Scale, AlertCircle, CheckCircle } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 mb-6">
                <Scale className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Terms of Service</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">
                Terms of <span className="gradient-text">Service</span>
              </h1>
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Content */}
            <div className="glass-card p-6 md:p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  1. Agreement to Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using Ausly ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, then you may not access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  2. Use License
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily access the materials on Ausly's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  3. User Accounts
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Maintaining the security of your account and password</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                  <p className="leading-relaxed">
                    We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or illegal activity.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  4. Content and Intellectual Property
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of Ausly and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You retain ownership of any content you submit, post, or display on or through the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  5. Prohibited Uses
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may not use our Service:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>In any way that violates any applicable law or regulation</li>
                  <li>To transmit any malicious code, viruses, or harmful data</li>
                  <li>To impersonate or attempt to impersonate the company or another user</li>
                  <li>In any way that infringes upon the rights of others</li>
                  <li>To engage in any automated use of the system</li>
                  <li>To interfere with or disrupt the Service or servers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-primary" />
                  6. Disclaimer
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, Ausly:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Excludes all representations, warranties, and conditions relating to our website and the use of this website</li>
                  <li>Does not guarantee the accuracy, completeness, or usefulness of any information on the Service</li>
                  <li>Is not responsible for any errors or omissions in content</li>
                  <li>Does not warrant that the Service will be available, uninterrupted, or error-free</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  7. Limitation of Liability
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall Ausly, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  8. Indemnification
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to defend, indemnify, and hold harmless Ausly and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  9. Third-Party Links
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our Service may contain links to third-party websites or services that are not owned or controlled by Ausly. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that Ausly shall not be responsible or liable for any damage or loss caused by or in connection with the use of any such content or services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  10. Termination
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  11. Governing Law
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be interpreted and governed by the laws of Germany, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  12. Changes to Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  13. Contact Information
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold text-foreground">Ausly</p>
                  <p className="text-muted-foreground">Email: <a href="mailto:hello@ausly.de" className="text-primary hover:underline">hello@ausly.de</a></p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
