import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FC } from "react";
import { useFormattedVersion } from "../../../../hooks/metadata/api/useVersion";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/api" },
    { label: "Changelog", href: "/changelog" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Press Kit", href: "/press" },
  ],
  community: [
    { label: "GitHub", href: "https://github.com/dearzubi/floagenticai" },
    { label: "Discord", href: "https://discord.gg/floagenticai" },
    { label: "Twitter", href: "https://twitter.com/floagenticai" },
    {
      label: "Discussions",
      href: "https://github.com/dearzubi/floagenticai/discussions",
    },
    {
      label: "Contributing",
      href: "https://github.com/dearzubi/floagenticai/blob/main/CONTRIBUTING.md",
    },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    {
      label: "License",
      href: "https://github.com/dearzubi/floagenticai/blob/main/LICENSE",
    },
    { label: "Security", href: "/security" },
  ],
};

const socialLinks = [
  {
    icon: "lucide:github",
    href: "https://github.com/dearzubi/floagenticai",
    label: "GitHub",
    color: "default",
  },
  {
    icon: "lucide:twitter",
    href: "https://twitter.com/floagenticai",
    label: "Twitter",
    color: "primary",
  },
  {
    icon: "lucide:message-circle",
    href: "https://discord.gg/floagenticai",
    label: "Discord",
    color: "secondary",
  },
  {
    icon: "lucide:linkedin",
    href: "https://linkedin.com/company/floagenticai",
    label: "LinkedIn",
    color: "success",
  },
];

const FooterSection: FC = () => {
  const { displayVersion: version, isLoading, isError } = useFormattedVersion();

  return (
    <footer className="bg-gray-950 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950/50 via-secondary-950/30 to-success-950/20" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 5,
          }}
          className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-600/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-lg shadow-lg">
                <Icon icon="lucide:workflow" width={32} />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                FloAgenticAI
              </span>
            </Link>

            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
              The future of AI workflow automation. Build, deploy, and scale
              intelligent agents with our visual no-code platform.
            </p>

            <div className="flex items-center gap-4 mb-6">
              {socialLinks.map((social) => (
                <motion.div
                  key={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    as="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    isIconOnly
                    variant="flat"
                    className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-400/30 hover:to-purple-400/30 text-white border-blue-400/30 hover:border-blue-300/50 shadow-lg hover:shadow-blue-500/25"
                    aria-label={social.label}
                  >
                    <Icon icon={social.icon} className="w-5 h-5" />
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Icon icon="lucide:heart" className="w-4 h-4 text-red-400" />
              <span>Made with love by the open source community</span>
            </div>
          </motion.div>
          {/*<motion.div*/}
          {/*  initial={{ opacity: 0, y: 20 }}*/}
          {/*  whileInView={{ opacity: 1, y: 0 }}*/}
          {/*  viewport={{ once: true }}*/}
          {/*  transition={{ duration: 0.6, delay: 0.1 }}*/}
          {/*>*/}
          {/*  <h3 className="font-semibold text-white mb-4 text-lg">Product</h3>*/}
          {/*  <ul className="space-y-3">*/}
          {/*    {footerLinks.product.map((link) => (*/}
          {/*      <li key={link.label}>*/}
          {/*        <a*/}
          {/*          href={link.href}*/}
          {/*          className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"*/}
          {/*        >*/}
          {/*          {link.label}*/}
          {/*        </a>*/}
          {/*      </li>*/}
          {/*    ))}*/}
          {/*  </ul>*/}
          {/*</motion.div>*/}

          {/*<motion.div*/}
          {/*  initial={{ opacity: 0, y: 20 }}*/}
          {/*  whileInView={{ opacity: 1, y: 0 }}*/}
          {/*  viewport={{ once: true }}*/}
          {/*  transition={{ duration: 0.6, delay: 0.2 }}*/}
          {/*>*/}
          {/*  <h3 className="font-semibold text-white mb-4 text-lg">Company</h3>*/}
          {/*  <ul className="space-y-3">*/}
          {/*    {footerLinks.company.map((link) => (*/}
          {/*      <li key={link.label}>*/}
          {/*        <a*/}
          {/*          href={link.href}*/}
          {/*          className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"*/}
          {/*        >*/}
          {/*          {link.label}*/}
          {/*        </a>*/}
          {/*      </li>*/}
          {/*    ))}*/}
          {/*  </ul>*/}
          {/*</motion.div>*/}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="font-semibold text-white mb-4 text-lg">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center gap-1"
                  >
                    {link.label}
                    <Icon icon="lucide:external-link" className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h4 className="font-semibold text-white mb-3 text-sm">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-gray-300 transition-colors duration-200 text-xs"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <Divider className="bg-white/10 mb-8" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-gray-400">
            <span>© 2024 FloAgenticAI. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                as="a"
                href="https://github.com/dearzubi/floagenticai"
                target="_blank"
                rel="noopener noreferrer"
                variant="bordered"
                size="sm"
                className="border-blue-400/30 text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-300/50 shadow-lg hover:shadow-blue-500/25"
                startContent={<Icon icon="lucide:star" className="w-4 h-4" />}
              >
                Star on GitHub
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/signin">
                <Button
                  color="primary"
                  size="sm"
                  className="font-semibold bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-blue-500/25"
                  startContent={
                    <Icon icon="lucide:rocket" className="w-4 h-4" />
                  }
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/20 rounded-full text-xs text-gray-300">
            <span
              className={`w-2 h-2 rounded-full shadow-lg ${
                isLoading
                  ? "bg-yellow-400 animate-pulse shadow-yellow-400/50"
                  : isError
                    ? "bg-red-400 shadow-red-400/50"
                    : "bg-gradient-to-r from-emerald-400 to-green-400 animate-pulse shadow-emerald-400/50"
              }`}
            />
            <span>Version {version}</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterSection;
