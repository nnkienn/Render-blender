import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Center, Environment, Html, OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, LoaderCircle, MoveDiagonal2, Package2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import api, { buildAssetUrl } from "../api/axios";
import type { Project } from "../types/project";

function ModelViewer({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  return (
    <Bounds fit clip observe margin={1.1}>
      <Center>
        <primitive object={scene} />
      </Center>
    </Bounds>
  );
}

function LoadingModel() {
  return (
    <Html center>
      <div className="rounded-full border border-white/10 bg-black/55 px-4 py-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/60">
        Loading geometry
      </div>
    </Html>
  );
}

function Observatory() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get<Project[]>("/api/projects");
        setProjects(response.data);
        setSelectedId(response.data[0]?.id ?? null);
      } finally {
        setLoading(false);
      }
    };

    void fetchProjects();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId]
  );

  const handleCopyCode = async () => {
    if (!selectedProject?.blender_script) {
      return;
    }

    await navigator.clipboard.writeText(selectedProject.blender_script);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="min-h-screen px-4 pb-8 pt-28 md:px-8">
      <div className="mx-auto grid max-w-[1480px] gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="panel-shell relative min-h-[72vh] overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5">
            <div className="space-y-3">
              <p className="eyebrow">Observatory</p>
              <div className="flex flex-wrap gap-2">
                <span className="chip chip-pink">3D Canvas</span>
                <span className="chip chip-blue">Orbit / Zoom</span>
                <span className="chip chip-green">GLB Archive</span>
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[0.64rem] uppercase tracking-[0.34em] text-white/55">
              Live Render
            </div>
          </div>

          {selectedProject ? (
            <>
              <Canvas gl={{ antialias: true, alpha: true }}>
                <PerspectiveCamera makeDefault position={[0, 1.8, 6]} fov={34} />
                <color attach="background" args={["#09090B"]} />
                <ambientLight intensity={0.95} />
                <directionalLight position={[4, 6, 5]} intensity={2.3} color="#ffffff" />
                <pointLight position={[-5, -3, -2]} intensity={11} color="#00C3FF" />
                <pointLight position={[4, 2, -4]} intensity={8} color="#FF2A85" />
                <Suspense fallback={<LoadingModel />}>
                  <Environment preset="city" />
                  <ModelViewer url={buildAssetUrl(selectedProject.file_url)} />
                </Suspense>
                <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.45} />
              </Canvas>

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_32%),linear-gradient(180deg,rgba(9,9,11,0),rgba(9,9,11,0.4)_70%,rgba(9,9,11,0.82))]" />

              <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <motion.div
                  key={selectedProject.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-xl rounded-[28px] border border-white/10 bg-black/35 p-5 backdrop-blur-xl"
                >
                  <p className="eyebrow">Project Signal</p>
                  <h2 className="mt-3 text-2xl text-white md:text-[2rem]">{selectedProject.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/58">{selectedProject.description}</p>
                </motion.div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="hud-card">
                    <Package2 size={16} className="text-nnkienn-pink" />
                    <span className="hud-card-label">Poly</span>
                    <strong className="hud-card-value">{selectedProject.poly_count}</strong>
                  </div>
                  <div className="hud-card">
                    <MoveDiagonal2 size={16} className="text-nnkienn-blue" />
                    <span className="hud-card-label">Controls</span>
                    <strong className="hud-card-value">Orbit / Zoom</strong>
                  </div>
                  <div className="hud-card">
                    <span className="h-2 w-2 rounded-full bg-nnkienn-green" />
                    <span className="hud-card-label">Captured</span>
                    <strong className="hud-card-value">{new Date(selectedProject.created_at).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[72vh] items-center justify-center text-center">
              <div>
                <p className="eyebrow">No selection</p>
                <p className="mt-3 text-sm text-white/52">Upload a project from Command Center to start the observatory.</p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.76, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          className="flex min-h-[72vh] flex-col gap-4"
        >
          <div className="panel-shell p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Archive Queue</p>
                <h3 className="mt-2 text-xl text-white">Model Index</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.62rem] uppercase tracking-[0.32em] text-white/48">
                {projects.length} loaded
              </span>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                <div className="flex items-center gap-3 rounded-3xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-white/55">
                  <LoaderCircle className="animate-spin" size={16} />
                  Syncing archive...
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-3xl border border-white/8 bg-white/[0.02] px-4 py-5 text-sm text-white/48">
                  No projects found.
                </div>
              ) : (
                projects.map((project) => {
                  const isActive = project.id === selectedId;

                  return (
                    <button
                      key={project.id}
                      onClick={() => setSelectedId(project.id)}
                      className={[
                        "w-full rounded-[26px] border px-4 py-4 text-left transition duration-300",
                        isActive
                          ? "border-white/12 bg-white/[0.07]"
                          : "border-white/8 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]"
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-white">{project.title}</p>
                        <span className="text-[0.62rem] uppercase tracking-[0.28em] text-white/36">#{project.id}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/46">{project.description}</p>
                      <div className="mt-3 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.3em] text-white/34">
                        <span>{project.poly_count}</span>
                        <span>•</span>
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="panel-shell min-h-0 flex-1 overflow-hidden p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Python Script</p>
                <h3 className="mt-2 text-xl text-white">bpy Viewer</h3>
              </div>
              <button
                onClick={() => void handleCopyCode()}
                disabled={!selectedProject?.blender_script}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[0.62rem] uppercase tracking-[0.32em] text-white/66 transition duration-300 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span className="inline-flex items-center gap-2">
                  <Copy size={14} />
                  {copied ? "Copied" : "Copy Code"}
                </span>
              </button>
            </div>

            <div className="min-h-0 overflow-hidden rounded-[24px] border border-white/8 bg-[#0F1014]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedProject?.id ?? "empty"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="h-full max-h-[42vh] overflow-auto"
                >
                  <SyntaxHighlighter
                    language="python"
                    style={atomDark}
                    customStyle={{
                      margin: 0,
                      minHeight: "100%",
                      background: "transparent",
                      padding: "1.25rem",
                      fontSize: "0.84rem",
                      lineHeight: "1.75"
                    }}
                    wrapLongLines
                  >
                    {selectedProject?.blender_script?.trim() || "# No bpy script attached to this project yet."}
                  </SyntaxHighlighter>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

export default Observatory;
