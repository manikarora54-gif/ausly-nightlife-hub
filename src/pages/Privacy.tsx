import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Privacy Policy</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">
                Privacy <span className="gradient-text">Policy</span>
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
                  1. Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Ausly ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-primary" />
                  2. Information We Collect
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                    <p className="leading-relaxed">
                      We may collect personal information that you voluntarily provide to us when you register for an account, make a purchase, subscribe to our newsletter, or contact us. This may include:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                      <li>Name and contact information (email address, phone number)</li>
                      <li>Account credentials (username, password)</li>
                      <li>Payment information (processed securely through third-party providers)</li>
                      <li>Profile information and preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Usage Data</h3>
                    <p className="leading-relaxed">
                      We automatically collect certain information when you visit our website, including:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                      <li>IP address and browser type</li>
                      <li>Pages visited and time spent on pages</li>
                      <li>Device information and operating system</li>
                      <li>Referring website addresses</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-primary" />
                  3. How We Use Your Information
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>To provide, maintain, and improve our services</li>
                  <li>To process transactions and send related information</li>
                  <li>To send you technical notices and support messages</li>
                  <li>To respond to your comments and questions</li>
                  <li>To send you marketing communications (with your consent)</li>
                  <li>To detect, prevent, and address technical issues</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  4. Information Sharing and Disclosure
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>With service providers who assist us in operating our website and conducting our business</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transfer or merger</li>
                  <li>With your explicit consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  5. Data Security
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  6. Your Rights
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>The right to access your personal information</li>
                  <li>The right to rectify inaccurate information</li>
                  <li>The right to request deletion of your information</li>
                  <li>The right to object to processing of your information</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  7. Cookies and Tracking Technologies
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  8. Children's Privacy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  9. Changes to This Privacy Policy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-semibold mb-4">
                  10. Contact Us
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
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

export default Privacy;
