import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { useNavigate } from "react-router-dom";

import type { ISourceOptions } from "@tsparticles/engine";

const heroLabel = "Procedural forms. Silent motion. Precise light.";

const particleOptions: ISourceOptions = {
  fullScreen: {
    enable: false
  },
  background: {
    color: {
      value: "transparent"
    }
  },
  detectRetina: true,
  fpsLimit: 120,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "repulse"
      },
      resize: {
        enable: true
      }
    },
    modes: {
      repulse: {
        distance: 120,
        duration: 0.8,
        factor: 100,
        speed: 0.9,
        maxSpeed: 18,
        easing: "ease-out-quad"
      }
    }
  },
  particles: {
    color: {
      value: ["#FF2A85", "#00C3FF", "#10B981"]
    },
    links: {
      enable: false
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "out"
      },
      random: true,
      speed: { min: 0.03, max: 0.12 },
      straight: false
    },
    number: {
      density: {
        enable: true,
        width: 1440,
        height: 900
      },
      value: 90
    },
    opacity: {
      value: { min: 0.12, max: 0.42 }
    },
    shape: {
      type: "circle"
    },
    size: {
      value: { min: 1, max: 3 }
    }
  }
};

let particlesReadyPromise: Promise<void> | null = null;

function Welcome() {
  const navigate = useNavigate();
  const [particlesReady, setParticlesReady] = useState(false);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    const prepareParticles = async () => {
      if (!particlesReadyPromise) {
        particlesReadyPromise = initParticlesEngine(async (engine) => {
          await loadFull(engine);
        });
      }

      await particlesReadyPromise;
      setParticlesReady(true);
    };

    void prepareParticles();
  }, []);

  useEffect(() => {
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 1;
      setTypedText(heroLabel.slice(0, frame));
      if (frame >= heroLabel.length) {
        window.clearInterval(timer);
      }
    }, 42);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-32">
      {particlesReady ? <Particles id="nnkienn-field" className="absolute inset-0" options={particleOptions} /> : null}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,42,133,0.08),transparent_22%),radial-gradient(circle_at_75%_25%,rgba(0,195,255,0.08),transparent_22%),radial-gradient(circle_at_30%_80%,rgba(16,185,129,0.08),transparent_24%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-w-3xl flex-col items-center text-center"
      >
        <div className="mb-10 flex flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
            <div className="grid h-7 w-7 grid-cols-2 gap-1">
              <span className="rounded-full bg-nnkienn-pink/90" />
              <span className="rounded-full bg-nnkienn-blue/90" />
              <span className="rounded-full bg-nnkienn-green/90" />
              <span className="rounded-full bg-white/80" />
            </div>
          </div>
          <p className="text-[0.62rem] uppercase tracking-[0.5em] text-white/42">Antigravity-Inspired 3D Portfolio</p>
        </div>

        <h1 className="max-w-2xl text-4xl font-medium leading-[1.05] text-white md:text-6xl">
          A restrained stage for geometry, scripts, and motion.
        </h1>

        <div className="mt-6 min-h-[1.4rem] text-[0.72rem] uppercase tracking-[0.35em] text-white/48 md:text-xs">
          {typedText}
          <span className="ml-1 inline-block h-3 w-px animate-pulse bg-white/45 align-middle" />
        </div>

        <p className="mt-8 max-w-xl text-sm leading-7 text-white/56 md:text-[0.95rem]">
          NNKIENN Render Platform curates Blender projects as quiet technical exhibits, with tactile 3D inspection and raw bpy context in one flow.
        </p>

        <motion.button
          whileHover={{ y: -2, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => navigate("/portfolio")}
          className="mt-12 rounded-full border border-white/12 bg-white/[0.03] px-7 py-3 text-[0.72rem] uppercase tracking-[0.38em] text-white transition duration-300 hover:border-white/22 hover:bg-white/[0.06]"
        >
          Enter Nnkienn
        </motion.button>
      </motion.div>
    </section>
  );
}

export default Welcome;
