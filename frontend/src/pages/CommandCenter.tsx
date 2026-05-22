import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Trash2, Upload } from "lucide-react";

import api from "../api/axios";
import type { Project } from "../types/project";

interface UploadFormState {
  title: string;
  polyCount: string;
  description: string;
  blenderScript: string;
}

const initialFormState: UploadFormState = {
  title: "",
  polyCount: "",
  description: "",
  blenderScript: ""
};

function CommandCenter() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<UploadFormState>(initialFormState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const totalProjects = useMemo(() => projects.length, [projects]);

  const fetchProjects = async () => {
    try {
      const response = await api.get<Project[]>("/api/projects");
      setProjects(response.data);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    void fetchProjects();
  }, []);

  const updateField = (field: keyof UploadFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["glb", "gltf"].includes(extension)) {
      window.alert("Only .glb and .gltf files are allowed.");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      window.alert("Please choose a .glb or .gltf file.");
      return;
    }

    const payload = new FormData();
    payload.append("file", selectedFile);
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("poly_count", form.polyCount);
    payload.append("blender_script", form.blenderScript);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      await api.post("/api/upload", payload, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        }
      });

      setForm(initialFormState);
      setSelectedFile(null);
      setUploadProgress(100);
      await fetchProjects();
    } finally {
      setIsUploading(false);
      window.setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!window.confirm("Delete this project and its uploaded model?")) {
      return;
    }

    await api.delete(`/api/projects/${projectId}`);
    setProjects((current) => current.filter((project) => project.id !== projectId));
  };

  return (
    <section className="min-h-screen px-4 pb-8 pt-28 md:px-8">
      <div className="mx-auto grid max-w-[1480px] gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="panel-shell p-6"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Command Center</p>
              <h2 className="mt-2 text-2xl text-white">Upload a Project Capsule</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.62rem] uppercase tracking-[0.32em] text-white/45">
              Admin Route
            </span>
          </div>

          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              handleFileSelect(event.dataTransfer.files[0] ?? null);
            }}
            className={[
              "mb-6 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-[30px] border border-dashed px-8 text-center transition duration-300",
              dragActive ? "border-nnkienn-blue/60 bg-white/[0.04]" : "border-white/12 bg-white/[0.02]"
            ].join(" ")}
          >
            <input
              type="file"
              accept=".glb,.gltf"
              className="hidden"
              onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
            />
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <Upload size={18} className="text-white/72" />
            </div>
            <p className="text-base text-white">{selectedFile ? selectedFile.name : "Drop .glb or .gltf here"}</p>
            <p className="mt-2 text-sm text-white/44">Large files stream through the API and persist on Docker volume-backed storage.</p>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="field-shell">
              <span className="field-label">Project Name</span>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                required
                className="field-input"
                placeholder="Orbital Relay"
              />
            </label>

            <label className="field-shell">
              <span className="field-label">Poly Count</span>
              <input
                value={form.polyCount}
                onChange={(event) => updateField("polyCount", event.target.value)}
                required
                className="field-input"
                placeholder="126,300"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="field-label">Metadata</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              required
              rows={4}
              className="field-textarea mt-2"
              placeholder="Describe material treatment, intent, lighting setup, and any notable spatial decisions."
            />
          </label>

          <label className="mt-4 block">
            <span className="field-label">Blender Python Script</span>
            <textarea
              value={form.blenderScript}
              onChange={(event) => updateField("blenderScript", event.target.value)}
              rows={11}
              className="field-textarea mt-2 font-mono text-[0.84rem] leading-7"
              placeholder={"import bpy\nbpy.ops.object.light_add(type='AREA', location=(0, 2, 4))"}
            />
          </label>

          <div className="mt-6 space-y-3">
            <AnimatePresence>
              {isUploading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="mb-2 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.32em] text-white/52">
                    <span>Transfer progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-nnkienn-pink via-nnkienn-blue to-nnkienn-green transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-6 py-4 text-[0.72rem] uppercase tracking-[0.36em] text-white transition duration-300 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? <LoaderCircle className="animate-spin" size={17} /> : <Upload size={17} />}
              {isUploading ? "Uploading" : "Transmit Project"}
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.74, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="panel-shell overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
            <div>
              <p className="eyebrow">Project Registry</p>
              <h2 className="mt-2 text-2xl text-white">Archive Management</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.62rem] uppercase tracking-[0.32em] text-white/45">
              {totalProjects} projects
            </span>
          </div>

          <div className="grid grid-cols-[minmax(0,1.4fr)_140px_140px_118px] gap-4 border-b border-white/8 px-6 py-4 text-[0.62rem] uppercase tracking-[0.34em] text-white/38">
            <span>Project</span>
            <span>Date</span>
            <span>Poly</span>
            <span className="text-right">Action</span>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {isLoadingProjects ? (
              <div className="flex items-center gap-3 px-6 py-8 text-sm text-white/54">
                <LoaderCircle className="animate-spin" size={16} />
                Loading registry...
              </div>
            ) : projects.length === 0 ? (
              <div className="px-6 py-8 text-sm text-white/46">No projects have been uploaded yet.</div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="grid grid-cols-[minmax(0,1.4fr)_140px_140px_118px] gap-4 border-b border-white/6 px-6 py-5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-white">{project.title}</p>
                    <p className="mt-1 truncate text-white/42">{project.description}</p>
                  </div>
                  <span className="text-white/48">{new Date(project.created_at).toLocaleDateString()}</span>
                  <span className="text-white/48">{project.poly_count}</span>
                  <div className="text-right">
                    <button
                      onClick={() => void handleDelete(project.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-400/18 bg-red-400/[0.06] px-4 py-2 text-[0.62rem] uppercase tracking-[0.3em] text-red-200/88 transition duration-300 hover:bg-red-400/[0.12]"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CommandCenter;
