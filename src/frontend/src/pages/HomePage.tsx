import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Award,
  ChevronRight,
  Flame,
  Instagram,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const stats = [
  { label: "MLAs", value: "12+", icon: Award },
  { label: "Candidates", value: "40+", icon: Users },
  { label: "Supporters", value: "10,000+", icon: UserPlus },
];

export default function HomePage() {
  return (
    <div data-ocid="home.section" className="font-body">
      {/* Hero Banner */}
      <section className="relative min-h-[75vh] flex items-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/uploads/borola-party2-1.jpg"
            alt="Borola Party Banner"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-transparent" />
        </div>

        {/* Diagonal saffron accent */}
        <div
          className="absolute top-0 right-0 w-40 h-full opacity-20"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, oklch(var(--saffron)) 50%)",
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-saffron/20 border border-saffron/40 rounded-full px-4 py-1.5 mb-4">
              <Flame className="w-4 h-4 text-saffron" />
              <span className="text-saffron text-xs font-bold tracking-widest uppercase">
                Official Party
              </span>
            </div>
            <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 max-w-3xl">
              We Are <span className="text-saffron">Borola Party</span>
            </h1>
            <p className="text-white/80 text-lg sm:text-xl max-w-2xl leading-relaxed mb-8">
              We promise development, employment, and a brighter future for
              every youth. Your vote is your power — together we will build a
              stronger tomorrow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/join">
                <Button
                  size="lg"
                  className="bg-saffron text-navy font-bold hover:bg-saffron-dark rounded-full px-8 shadow-lg"
                >
                  Join the Party
                  <ChevronRight className="ml-1 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/candidates">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 hover:text-white rounded-full px-8"
                >
                  Meet Our Candidates
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-saffron py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-navy" />
                  <div>
                    <div className="font-display text-navy text-2xl font-bold leading-none">
                      {stat.value}
                    </div>
                    <div className="text-navy/70 text-xs uppercase tracking-wider font-semibold">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Party Intro */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-saffron" />
                <span className="text-saffron text-sm font-bold tracking-widest uppercase">
                  Our Vision
                </span>
              </div>
              <h2 className="font-display text-navy text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                A New Chapter for <br />
                <span className="text-saffron">Our People</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We are the candidates of Borola Party. We promise development,
                employment, and a brighter future for every youth. Your vote is
                your power — together we will build a stronger tomorrow.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Borola Party stands for transparent governance, inclusive
                growth, and unwavering commitment to the people. From villages
                to cities, we will ensure that every voice is heard and every
                dream is given a chance.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/Borolaofficial0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-navy hover:text-saffron transition-colors font-semibold"
                >
                  <Instagram className="w-5 h-5" />
                  <span>@Borolaofficial0</span>
                </a>
              </div>
            </motion.div>

            {/* Visual cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                {
                  title: "Development",
                  desc: "Infrastructure, roads, and modern amenities for all regions",
                  icon: "🏗️",
                },
                {
                  title: "Employment",
                  desc: "New jobs, skill programs, and entrepreneurship support",
                  icon: "💼",
                },
                {
                  title: "Youth Power",
                  desc: "Empowering the next generation with education and opportunity",
                  icon: "⚡",
                },
                {
                  title: "Unity",
                  desc: "One voice, one vision — building bridges across communities",
                  icon: "🤝",
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className={`p-5 rounded-xl border border-border shadow-card hover:shadow-navy transition-shadow ${
                    i % 2 === 1 ? "mt-6" : ""
                  }`}
                >
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-display text-navy font-bold text-lg mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-snug">
                    {item.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-navy text-2xl sm:text-3xl font-bold">
              Explore Borola Party
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                to: "/mlas",
                label: "Members of Legislative Assembly",
                icon: Award,
                desc: "Meet our elected representatives",
              },
              {
                to: "/candidates",
                label: "Our Candidates",
                icon: Users,
                desc: "Candidates for the upcoming elections",
              },
              {
                to: "/supporters",
                label: "Our Supporters",
                icon: UserPlus,
                desc: "Join thousands of Borola supporters",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to}>
                  <div className="group p-6 bg-white rounded-xl border border-border hover:border-saffron hover:shadow-navy transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center mb-4 group-hover:bg-saffron transition-colors">
                      <Icon className="w-6 h-6 text-white group-hover:text-navy transition-colors" />
                    </div>
                    <h3 className="font-display text-navy font-bold text-lg mb-1 leading-tight">
                      {item.label}
                    </h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-saffron text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-navy relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, oklch(var(--saffron)) 0, oklch(var(--saffron)) 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-white text-3xl sm:text-4xl font-bold mb-4">
            Be Part of the Change
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Join thousands of citizens committed to a better future. Register as
            a Borola Party supporter today.
          </p>
          <Link to="/join">
            <Button
              size="lg"
              className="bg-saffron text-navy font-bold hover:bg-saffron-dark rounded-full px-10 text-lg shadow-lg"
            >
              Join the Borola Party
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
