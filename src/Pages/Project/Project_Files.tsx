/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useRef } from 'react';
import { Film, FileVideo, Search, ChevronLeft, ChevronRight, Eye, AlertCircle, X, ZoomIn } from 'lucide-react';
import Navbar_Project from "../../components/Navbar_Project";
import axios from "axios";
import ENDPOINTS from "../../config";
import PixelLoadingSkeleton from '../../components/PixelLoadingSkeleton';

// ── Native debounce hook ──────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(value), delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectFile {
  id: number | string;
  name: string;
  ext: string;
  thumb: string | null;
  downloadUrl: string;
  link: string;
  linkType: 'asset' | 'shot' | string;
  status: string;
  desc: string;
  user: string;
  date: string;
  source: 'asset' | 'shot';
  version: string;
}

type TabKey = 'all' | 'asset' | 'shot';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [25, 50, 100, 150, 200, 500];
const THUMB_W = 52;
const THUMB_H = 30;

const VIDEO_EXT = /^(mp4|webm|mov|avi|mkv|m4v|ogv|flv|wmv|3gp|ts|mts|m2ts)$/;
const IMAGE_EXT = /^(jpg|jpeg|png|gif|webp|bmp|tiff?|svg|avif|heic|heif|jfif)$/;

const EXT_CLASS: Record<string, string> = {
  mov:  'bg-red-500/10 border border-red-500/30 text-red-400',
  mp4:  'bg-sky-500/10 border border-sky-500/30 text-sky-400',
  webm: 'bg-violet-500/10 border border-violet-500/30 text-violet-400',
  avi:  'bg-amber-500/10 border border-amber-500/30 text-amber-400',
  mkv:  'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
  jpg:  'bg-pink-500/10 border border-pink-500/30 text-pink-400',
  jpeg: 'bg-pink-500/10 border border-pink-500/30 text-pink-400',
  png:  'bg-pink-500/10 border border-pink-500/30 text-pink-400',
  gif:  'bg-orange-500/10 border border-orange-500/30 text-orange-400',
  pdf:  'bg-red-600/10 border border-red-600/30 text-red-500',
  zip:  'bg-neutral-500/10 border border-neutral-500/30 text-neutral-400',
};

const VERSION_STATUS: Record<string, { fullLabel: string; dotColor: string; border: string; text: string; bg: string; icon: 'dot' | '-' }> = {
  wtg:   { fullLabel: 'Waiting',        dotColor: 'bg-gray-600',    border: 'border-gray-500/50',    text: 'text-gray-300',    bg: 'bg-gray-600/15',    icon: '-'   },
  ip:    { fullLabel: 'In Progress',    dotColor: 'bg-blue-500',    border: 'border-blue-400/50',    text: 'text-blue-300',    bg: 'bg-blue-500/15',    icon: 'dot' },
  fin:   { fullLabel: 'Final',          dotColor: 'bg-green-500',   border: 'border-green-400/50',   text: 'text-green-300',   bg: 'bg-green-500/15',   icon: 'dot' },
  apr:   { fullLabel: 'Approved',       dotColor: 'bg-green-500',   border: 'border-green-400/50',   text: 'text-green-300',   bg: 'bg-green-500/15',   icon: 'dot' },
  cmpt:  { fullLabel: 'Complete',       dotColor: 'bg-blue-600',    border: 'border-blue-500/50',    text: 'text-blue-300',    bg: 'bg-blue-600/15',    icon: 'dot' },
  cfrm:  { fullLabel: 'Confirmed',      dotColor: 'bg-purple-500',  border: 'border-purple-400/50',  text: 'text-purple-300',  bg: 'bg-purple-500/15',  icon: 'dot' },
  nef:   { fullLabel: 'Need fixed',     dotColor: 'bg-red-500',     border: 'border-red-400/50',     text: 'text-red-300',     bg: 'bg-red-500/15',     icon: 'dot' },
  dlvr:  { fullLabel: 'Delivered',      dotColor: 'bg-cyan-500',    border: 'border-cyan-400/50',    text: 'text-cyan-300',    bg: 'bg-cyan-500/15',    icon: 'dot' },
  rts:   { fullLabel: 'Rdy to Start',   dotColor: 'bg-orange-500',  border: 'border-orange-400/50',  text: 'text-orange-300',  bg: 'bg-orange-500/15',  icon: 'dot' },
  rev:   { fullLabel: 'Review',         dotColor: 'bg-yellow-600',  border: 'border-yellow-500/50',  text: 'text-yellow-300',  bg: 'bg-yellow-600/15',  icon: 'dot' },
  omt:   { fullLabel: 'Omit',           dotColor: 'bg-gray-500',    border: 'border-gray-400/50',    text: 'text-gray-300',    bg: 'bg-gray-500/15',    icon: 'dot' },
  ren:   { fullLabel: 'Rendering',      dotColor: 'bg-pink-500',    border: 'border-pink-400/50',    text: 'text-pink-300',    bg: 'bg-pink-500/15',    icon: 'dot' },
  hld:   { fullLabel: 'On Hold',        dotColor: 'bg-orange-600',  border: 'border-orange-500/50',  text: 'text-orange-300',  bg: 'bg-orange-600/15',  icon: 'dot' },
  vwd:   { fullLabel: 'Viewed',         dotColor: 'bg-teal-500',    border: 'border-teal-400/50',    text: 'text-teal-300',    bg: 'bg-teal-500/15',    icon: 'dot' },
  crv:   { fullLabel: 'Client Rev.',    dotColor: 'bg-purple-600',  border: 'border-purple-500/50',  text: 'text-purple-300',  bg: 'bg-purple-600/15',  icon: 'dot' },
  na:    { fullLabel: 'N/A',            dotColor: 'bg-gray-400',    border: 'border-gray-300/50',    text: 'text-gray-200',    bg: 'bg-gray-400/15',    icon: '-'   },
  pndng: { fullLabel: 'Pending',        dotColor: 'bg-yellow-400',  border: 'border-yellow-300/50',  text: 'text-yellow-200',  bg: 'bg-yellow-400/15',  icon: 'dot' },
  cap:   { fullLabel: 'Client Appr.',   dotColor: 'bg-green-400',   border: 'border-green-300/50',   text: 'text-green-200',   bg: 'bg-green-400/15',   icon: 'dot' },
  recd:  { fullLabel: 'Received',       dotColor: 'bg-blue-400',    border: 'border-blue-300/50',    text: 'text-blue-200',    bg: 'bg-blue-400/15',    icon: 'dot' },
  chk:   { fullLabel: 'Checking',       dotColor: 'bg-lime-500',    border: 'border-lime-400/50',    text: 'text-lime-300',    bg: 'bg-lime-500/15',    icon: 'dot' },
  rdd:   { fullLabel: 'Render done',    dotColor: 'bg-emerald-500', border: 'border-emerald-400/50', text: 'text-emerald-300', bg: 'bg-emerald-500/15', icon: 'dot' },
  srd:   { fullLabel: 'Submit render',  dotColor: 'bg-indigo-500',  border: 'border-indigo-400/50',  text: 'text-indigo-300',  bg: 'bg-indigo-500/15',  icon: 'dot' },
  sos:   { fullLabel: 'Send outsrc.',   dotColor: 'bg-violet-500',  border: 'border-violet-400/50',  text: 'text-violet-300',  bg: 'bg-violet-500/15',  icon: 'dot' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Data mapper
// ─────────────────────────────────────────────────────────────────────────────

function mapFile(raw: any): ProjectFile {
  const name: string = raw.file_name ?? raw.name ?? 'Untitled';
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';

  const isMedia = VIDEO_EXT.test(ext) || IMAGE_EXT.test(ext);
  const thumb: string | null = raw.thumbnail_url ?? (isMedia ? (raw.download_url ?? null) : null);

  const linked   = raw.linked_entity ?? {};
  const linkName = linked.name ?? '—';
  const linkStr  = linkName.length > 22 ? linkName.slice(0, 20) + '…' : linkName;

  const uploaderObj = raw.uploaded_by ?? {};
  const user = typeof uploaderObj === 'string'
    ? uploaderObj
    : (uploaderObj.name ?? uploaderObj.email ?? 'Manager');

  const ver = raw.version;
  const versionLabel = ver
    ? `${ver.name ?? ''}${ver.number != null ? ` (v${ver.number})` : ''}`.trim()
    : '';

  let date = '—';
  if (raw.created_at) {
    try {
      date = new Date(raw.created_at).toLocaleString('en-US', {
        month: '2-digit', day: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch { date = raw.created_at; }
  }

  // ── description fallback chain
  // raw.description = already resolved by backend (file → note → version → task)
  // raw.linked_entity?.description = project_assets/shots description (separate, not in top-level chain)
  const desc: string =
    raw.description?.trim()                  ||
    raw.note?.subject?.trim()                ||
    ver?.description?.trim()                 ||
    ver?.task_description?.trim()            ||
    '';

  return {
    id: raw.id ?? Math.random(),
    name, ext, thumb,
    downloadUrl: raw.download_url ?? '',
    link: linkStr,
    linkType: linked.type ?? raw.source ?? '',
    status: ver?.status ?? '',
    desc,
    user, date,
    source: raw.source === 'shot' ? 'shot' : 'asset',
    version: versionLabel,
  };
}

function resolveThumbSrc(thumb: string | null): string | null {
  if (!thumb) return null;
  if (thumb.startsWith('http')) return thumb;
  const base = (ENDPOINTS.image_url ?? '').replace(/\/$/, '');
  return `${base}/${thumb.replace(/^\//, '')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectFiles() {

  const [assetFiles, setAssetFiles] = useState<ProjectFile[]>([]);
  const [shotFiles,  setShotFiles]  = useState<ProjectFile[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [activeTab,   setActiveTab]   = useState<TabKey>('all');
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(50);
  const [sortCol,     setSortCol]     = useState<keyof ProjectFile>('date');
  const [sortDir,     setSortDir]     = useState<'asc' | 'desc'>('desc');
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  const [previewSrc,  setPreviewSrc]  = useState('');
  const [thumbFailed, setThumbFailed] = useState<Set<number | string>>(new Set());

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedData = localStorage.getItem('projectData');
        let projectId: string | number | null = null;
        if (storedData) {
          const pd = JSON.parse(storedData);
          projectId = pd.projectId ?? pd.id ?? pd.projectInfo?.project?.id ?? pd.projectInfo?.projects?.[0]?.id ?? null;
        }
        const url = projectId ? `${ENDPOINTS.ALL_PROJECT_FILES}?project_id=${projectId}` : ENDPOINTS.ALL_PROJECT_FILES;
        const res  = await axios.post(url);
        const data = res.data ?? {};
        setAssetFiles((data.asset_files ?? []).map(mapFile));
        setShotFiles((data.shot_files   ?? []).map(mapFile));
      } catch (err: any) {
        if (err?.response?.status === 404) { setAssetFiles([]); setShotFiles([]); }
        else setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load files');
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────

  const debouncedSearch = useDebounce(search, 200);
  const allFiles = useMemo(() => [...assetFiles, ...shotFiles], [assetFiles, shotFiles]);

  const tabFiles = useMemo<Record<TabKey, ProjectFile[]>>(() => ({
    all: allFiles, asset: assetFiles, shot: shotFiles,
  }), [allFiles, assetFiles, shotFiles]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return tabFiles[activeTab];
    return tabFiles[activeTab].filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.user.toLowerCase().includes(q) ||
      f.link.toLowerCase().includes(q) ||
      f.desc.toLowerCase().includes(q)   // ✅ search ใน description ด้วย
    );
  }, [tabFiles, activeTab, debouncedSearch]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => {
      const va = String(a[sortCol] ?? '');
      const vb = String(b[sortCol] ?? '');
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    }),
    [filtered, sortCol, sortDir]
  );

  const total      = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged      = useMemo(() =>
    sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSort = (col: keyof ProjectFile) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const handleTabChange = (tab: TabKey) => { setActiveTab(tab); setPage(1); };

  const openPreview = (file: ProjectFile) => {
    const src = resolveThumbSrc(file.thumb);
    if (!src) return;
    setPreviewFile(file);
    setPreviewSrc(src);
  };

  const handleDownload = async (file: ProjectFile) => {
    if (!file.downloadUrl) return;
    const base = (ENDPOINTS.image_url ?? '').replace(/\/$/, '');
    const url = file.downloadUrl.startsWith('http')
      ? file.downloadUrl
      : `${base}/${file.downloadUrl.replace(/^\//, '')}`;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // fallback: direct link
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setPreviewFile(null); setPreviewSrc(''); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #0d1117 0%, #0f1520 50%, #0d1117 100%)' }}>

      {/* Navbar */}
      <div className="pt-14">
        <Navbar_Project activeTab="other" />
      </div>

      {/* ── Toolbar ── */}
      <div
        className="flex items-center gap-0.5 px-2 py-1 border-b shrink-0 pt-14"
        style={{
          borderColor: 'rgba(99,120,160,0.18)',
          background: 'linear-gradient(180deg, rgba(16,22,36,0.98) 0%, rgba(13,18,28,0.98) 100%)',
          boxShadow: '0 1px 0 rgba(99,160,255,0.06)',
        }}
      >
        {(['all', 'asset', 'shot'] as TabKey[]).map(tab => {
          const count  = tab === 'all' ? allFiles.length : tab === 'asset' ? assetFiles.length : shotFiles.length;
          const label  = tab === 'all' ? 'All Files' : tab === 'asset' ? 'Assets' : 'Shots';
          const active = activeTab === tab;
          const tabColors:  Record<TabKey, string> = { all: 'rgba(96,165,250,0.12)',  asset: 'rgba(139,92,246,0.12)',  shot: 'rgba(34,197,94,0.12)'  };
          const tabBorders: Record<TabKey, string> = { all: 'rgba(96,165,250,0.45)',  asset: 'rgba(139,92,246,0.45)',  shot: 'rgba(34,197,94,0.45)'  };
          const tabText:    Record<TabKey, string> = { all: '#93c5fd',                asset: '#c4b5fd',                shot: '#86efac'               };
          const badgeBg:    Record<TabKey, string> = { all: 'rgba(96,165,250,0.2)',   asset: 'rgba(139,92,246,0.2)',   shot: 'rgba(34,197,94,0.2)'   };
          return (
            <div
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all duration-150"
              style={{
                background:    active ? tabColors[tab]  : 'transparent',
                border:        active ? `1px solid ${tabBorders[tab]}` : '1px solid transparent',
                color:         active ? tabText[tab]    : 'rgba(120,135,160,0.8)',
                boxShadow:     active ? `0 0 10px ${tabColors[tab]}` : 'none',
                letterSpacing: '0.02em',
              }}
            >
              {label}
              <span
                className="px-1 py-px rounded-full text-[8px] font-bold tabular-nums"
                style={{
                  background: active ? badgeBg[tab] : 'rgba(60,70,90,0.5)',
                  color:      active ? tabText[tab] : 'rgba(100,115,140,0.9)',
                }}
              >
                {count}
              </span>
            </div>
          );
        })}

        <div className="flex-1" />

        <span style={{ fontSize: 10, color: 'rgba(80,100,140,0.6)', marginRight: 8, fontVariantNumeric: 'tabular-nums' }}>
          {total} files
        </span>

        <div
          className="flex items-center gap-1 rounded px-2 py-0.5 w-36 transition-all"
          style={{ background: 'rgba(10,15,25,0.8)', border: '1px solid rgba(80,100,140,0.3)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)' }}
        >
          <Search size={10} style={{ color: 'rgba(100,130,180,0.6)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search…"
            className="bg-transparent border-none outline-none w-full font-mono"
            style={{ fontSize: 10, color: '#c8d3e8', caretColor: '#60a5fa' }}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(60,80,120,0.4) transparent' }}>

        {loading && <PixelLoadingSkeleton />}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle size={18} style={{ color: '#f87171' }} />
            </div>
            <span className="text-xs" style={{ color: '#f87171' }}>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-1 rounded text-white text-xs font-semibold transition-all cursor-pointer border-none"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 0 14px rgba(59,130,246,0.35)' }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && allFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(30,40,60,0.6)', border: '1px solid rgba(60,80,120,0.3)' }}>
              <FileVideo size={22} style={{ color: 'rgba(80,100,140,0.6)' }} />
            </div>
            <span className="text-xs" style={{ color: 'rgba(100,120,160,0.7)' }}>No files found for this project</span>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && allFiles.length > 0 && (
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '27%' }} />        {/* File      */}
              <col style={{ width: THUMB_W + 14 }} /> {/* Thumb     */}
              <col style={{ width: '16%' }} />        {/* Links     */}
              <col style={{ width: 110 }} />           {/* Status    */}
              <col style={{ width: '22%' }} />        {/* Desc      */}
              <col style={{ width: '12%' }} />        {/* By        */}
              <col style={{ width: 112 }} />           {/* Date      */}
            </colgroup>

            <thead>
              <tr
                className="sticky top-0 z-10"
                style={{
                  background: 'linear-gradient(180deg, rgba(14,20,34,0.99) 0%, rgba(12,18,30,0.99) 100%)',
                  borderBottom: '1px solid rgba(60,80,120,0.35)',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.4)',
                }}
              >
                {(
                  [
                    { col: 'name',   label: 'File'        },
                    { col: null,     label: 'Thumb'       },
                    { col: null,     label: 'Links'       },
                    { col: 'status', label: 'Status'      },
                    { col: 'desc',   label: 'Description' },
                    { col: 'user',   label: 'By'          },
                    { col: 'date',   label: 'Date'        },
                  ] as { col: keyof ProjectFile | null; label: string }[]
                ).map(({ col, label }, i) => {
                  const isSortable = col !== null;
                  const isActive   = isSortable && sortCol === col;
                  return (
                    <th
                      key={i}
                      onClick={isSortable ? () => handleSort(col!) : undefined}
                      className="px-1.5 py-1 text-left font-semibold select-none whitespace-nowrap"
                      style={{
                        fontSize: '8px',
                        letterSpacing: '0.09em',
                        textTransform: 'uppercase',
                        color:  isActive ? '#60a5fa' : 'rgba(90,110,150,0.85)',
                        cursor: isSortable ? 'pointer' : 'default',
                        transition: 'color 0.15s',
                      }}
                    >
                      {label}
                      {isActive && (
                        <span style={{ marginLeft: 3, opacity: 0.9, color: '#60a5fa' }}>
                          {sortDir === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {paged.map((file, i) => {
                const ext     = file.ext.toLowerCase();
                const isImage = IMAGE_EXT.test(ext);
                const isVideo = VIDEO_EXT.test(ext);
                const src     = resolveThumbSrc(file.thumb);
                const hasSrc  = !!src && (isImage || isVideo);
                const failed  = thumbFailed.has(file.id);
                const cb      = (s: string) => s.includes('?') ? `${s}&_cb=1` : `${s}?_cb=1`;
                const status  = VERSION_STATUS[file.status?.toLowerCase()];
                const fixedSz = { width: THUMB_W, height: THUMB_H, minWidth: THUMB_W, minHeight: THUMB_H };
                const rowBg   = i % 2 === 0 ? 'rgba(13,19,32,0.65)' : 'rgba(16,23,38,0.5)';

                return (
                  <tr
                    key={`${file.source}-${file.id}`}
                    style={{ background: rowBg, borderBottom: '1px solid rgba(35,50,75,0.4)', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(28,46,85,0.35)')}
                    onMouseLeave={e => (e.currentTarget.style.background = rowBg)}
                  >

                    {/* File name — click to download */}
                    <td className="px-1.5 py-px align-middle">
                      <div
                        className="flex items-center gap-1 overflow-hidden group/name"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDownload(file)}
                        title={`Download ${file.name}`}
                      >
                        <span
                          className={`inline-flex items-center justify-center rounded shrink-0 ${EXT_CLASS[ext] ?? 'bg-gray-500/10 border border-gray-500/30 text-gray-400'}`}
                          style={{ width: 14, height: 14, fontSize: 7 }}
                        >
                          <Film size={7} />
                        </span>
                        <span
                          className="overflow-hidden text-ellipsis whitespace-nowrap group-hover/name:underline"
                          style={{ fontSize: 10, color: '#7eb8f7', letterSpacing: '0.01em', fontWeight: 500 }}
                          title={file.name}
                        >
                          {file.name}
                        </span>
                      </div>
                    </td>

                    {/* Thumbnail */}
                    <td className="px-1.5 py-px align-middle">
                      {!hasSrc ? (
                        <div style={{ ...fixedSz, borderRadius: 3, border: '1px solid rgba(50,65,90,0.5)', background: 'rgba(10,15,25,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          {isVideo ? <Film size={9} style={{ color: 'rgba(56,130,210,0.4)' }} /> : <FileVideo size={9} style={{ color: 'rgba(80,100,130,0.4)' }} />}
                          {ext && <span style={{ fontSize: 6, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(80,100,130,0.5)' }}>{ext}</span>}
                        </div>
                      ) : failed ? (
                        <div style={{ ...fixedSz, borderRadius: 3, border: '1px solid rgba(50,65,90,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12,18,30,0.7)' }}>
                          <FileVideo size={9} style={{ color: 'rgba(90,110,140,0.5)' }} />
                        </div>
                      ) : (
                        <div
                          style={{ ...fixedSz, borderRadius: 3, border: '1px solid rgba(60,100,160,0.3)', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                          onClick={() => openPreview(file)}
                          className="group"
                        >
                          {isVideo
                            ? <video src={cb(src!)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px)', transform: 'scale(1.1)' }} muted loop autoPlay playsInline aria-hidden />
                            : <img   src={cb(src!)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px)', transform: 'scale(1.1)' }} aria-hidden />
                          }
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
                          {isVideo
                            ? <video src={cb(src!)} style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain' }} muted loop autoPlay playsInline onError={() => setThumbFailed(p => new Set(p).add(file.id))} />
                            : <img   src={cb(src!)} alt="thumb" style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setThumbFailed(p => new Set(p).add(file.id))} />
                          }
                          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,20,60,0.55)' }}>
                            <ZoomIn size={9} style={{ color: '#fff' }} />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Links */}
                    <td className="px-1.5 py-px align-middle">
                      <div className="flex items-center gap-1 overflow-hidden">
                        <div style={{ width: 13, height: 13, borderRadius: 3, background: 'rgba(30,45,75,0.7)', border: '1px solid rgba(60,90,140,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Film size={6} style={{ color: 'rgba(100,140,200,0.7)' }} />
                        </div>
                        <span style={{ fontSize: 10, color: '#7eb8f7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.link || '—'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-1.5 py-px align-middle">
                      {status ? (
                        <span
                          className={`inline-flex items-center gap-0.5 px-1 py-px rounded-full font-semibold whitespace-nowrap border ${status.bg} ${status.border} ${status.text}`}
                          style={{ fontSize: 8, letterSpacing: '0.01em' }}
                        >
                          {status.icon === 'dot'
                            ? <span className={`w-1 h-1 rounded-full shrink-0 ${status.dotColor}`} />
                            : <span style={{ opacity: 0.5, lineHeight: 1 }}>—</span>}
                          {status.fullLabel}
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(80,100,130,0.5)', fontSize: 10 }}>—</span>
                      )}
                    </td>

                    {/* Description ✅ */}
                    <td className="px-1.5 py-px align-middle">
                      {file.desc ? (
                        <span
                          className="block overflow-hidden text-ellipsis whitespace-nowrap"
                          style={{ fontSize: 10, color: 'rgba(175,190,215,0.75)' }}
                          title={file.desc}
                        >
                          {file.desc}
                        </span>
                      ) : (
                        <span style={{ fontSize: 9, color: 'rgba(55,75,105,0.6)' }}>—</span>
                      )}
                    </td>

                    {/* Created by */}
                    <td className="px-1.5 py-px align-middle">
                      <div className="flex items-center gap-1">
                        <div style={{ width: 13, height: 13, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(37,99,235,0.4), rgba(99,102,241,0.4))', border: '1px solid rgba(99,130,220,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Eye size={6} style={{ color: '#93c5fd' }} />
                        </div>
                        <span style={{ fontSize: 10, color: '#7eb8f7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.user}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-1.5 py-px align-middle">
                      <span style={{ fontSize: 9, color: 'rgba(120,142,178,0.7)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{file.date}</span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination footer ── */}
      {!loading && !error && allFiles.length > 0 && (
        <div
          className="flex items-center justify-between px-2 py-1 shrink-0"
          style={{
            borderTop: '1px solid rgba(50,70,110,0.35)',
            background: 'linear-gradient(180deg, rgba(12,18,30,0.98) 0%, rgba(10,15,25,0.98) 100%)',
            fontSize: 9,
            color: 'rgba(100,120,160,0.7)',
          }}
        >
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {total === 0 ? '0' : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)}`}
            <span style={{ color: 'rgba(70,90,120,0.7)', margin: '0 3px' }}>of</span>
            {total}
            <span style={{ color: 'rgba(70,90,120,0.7)', marginLeft: 3 }}>files</span>
          </span>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span style={{ color: 'rgba(70,90,120,0.7)', fontSize: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Rows</span>
              <div className="flex items-center" style={{ border: '1px solid rgba(50,70,110,0.4)', borderRadius: 4, overflow: 'hidden' }}>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <div
                    key={size}
                    onClick={() => { setPageSize(size); setPage(1); }}
                    className="cursor-pointer transition-all"
                    style={{
                      padding: '1px 5px',
                      fontSize: 9,
                      background: pageSize === size ? 'rgba(37,99,235,0.25)' : 'transparent',
                      color:      pageSize === size ? '#93c5fd'               : 'rgba(100,120,160,0.7)',
                      borderRight: '1px solid rgba(50,70,110,0.3)',
                      fontWeight:  pageSize === size ? 600 : 400,
                    }}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ width: 18, height: 16, borderRadius: 3, background: 'transparent', border: '1px solid rgba(60,80,120,0.4)', color: 'rgba(130,155,200,0.8)' }}
              >
                <ChevronLeft size={8} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                const p = totalPages > 7 ? start + i : i + 1;
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="cursor-pointer transition-all flex items-center justify-center"
                    style={{
                      minWidth: 18, height: 16, padding: '0 4px', borderRadius: 3, fontSize: 9,
                      background: isActive ? 'rgba(37,99,235,0.3)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(96,165,250,0.5)' : 'rgba(60,80,120,0.35)'}`,
                      color:  isActive ? '#93c5fd' : 'rgba(100,125,170,0.8)',
                      fontWeight: isActive ? 600 : 400,
                      boxShadow: isActive ? '0 0 5px rgba(96,165,250,0.2)' : 'none',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ width: 18, height: 16, borderRadius: 3, background: 'transparent', border: '1px solid rgba(60,80,120,0.4)', color: 'rgba(130,155,200,0.8)' }}
              >
                <ChevronRight size={8} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview modal ── */}
      {previewFile && previewSrc && (() => {
        const isVideo = VIDEO_EXT.test(previewFile.ext.toLowerCase());
        const cb = previewSrc.includes('?') ? `${previewSrc}&_cb=1` : `${previewSrc}?_cb=1`;
        const st = VERSION_STATUS[previewFile.status?.toLowerCase()];
        return (
          <div
            className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center"
            style={{ top: 112, background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => { setPreviewFile(null); setPreviewSrc(''); }}
          >
            <div
              className="relative max-w-4xl w-full mx-4 overflow-hidden"
              style={{
                borderRadius: 10,
                background: 'linear-gradient(160deg, rgba(14,22,40,0.98) 0%, rgba(10,16,30,0.98) 100%)',
                border: '1px solid rgba(60,100,180,0.3)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(80,120,220,0.08)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* header */}
              <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(50,70,110,0.4)', background: 'rgba(10,16,28,0.6)' }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#c8d3e8', letterSpacing: '0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                  {previewFile.name}
                </span>
                <button
                  onClick={() => { setPreviewFile(null); setPreviewSrc(''); }}
                  className="w-5 h-5 flex items-center justify-center rounded transition-colors"
                  style={{ background: 'transparent', border: '1px solid transparent', color: 'rgba(130,150,190,0.6)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(130,150,190,0.6)'; }}
                >
                  <X size={11} />
                </button>
              </div>

              {/* media */}
              <div className="relative overflow-hidden flex items-center justify-center" style={{ minHeight: 180, maxHeight: '75vh', background: '#07101c' }}>
                {isVideo
                  ? <video src={cb} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(24px)', transform: 'scale(1.15)', opacity: 0.4 }} muted loop autoPlay playsInline aria-hidden />
                  : <img   src={cb} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(24px)', transform: 'scale(1.15)', opacity: 0.4 }} aria-hidden />
                }
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
                {isVideo
                  ? <video src={cb} className="relative z-10 max-w-full object-contain" style={{ maxHeight: '75vh' }} controls autoPlay muted loop playsInline />
                  : <img   src={cb} alt={previewFile.name} className="relative z-10 max-w-full object-contain" style={{ maxHeight: '75vh' }} />
                }
              </div>

              {/* footer — meta + description ✅ */}
              <div className="flex flex-col gap-1 px-3 py-2" style={{ borderTop: '1px solid rgba(50,70,110,0.4)', background: 'rgba(10,16,28,0.6)' }}>
                <div className="flex items-center gap-2.5 flex-wrap" style={{ fontSize: 10 }}>
                  <span style={{ color: 'rgba(130,155,195,0.8)' }}>{previewFile.user}</span>
                  <span style={{ color: 'rgba(60,80,110,0.8)' }}>·</span>
                  <span style={{ color: 'rgba(100,125,165,0.7)', fontVariantNumeric: 'tabular-nums' }}>{previewFile.date}</span>
                  {previewFile.link && previewFile.link !== '—' && (
                    <>
                      <span style={{ color: 'rgba(60,80,110,0.8)' }}>·</span>
                      <span style={{ color: '#7eb8f7' }}>{previewFile.link}</span>
                    </>
                  )}
                  {st && (
                    <>
                      <span style={{ color: 'rgba(60,80,110,0.8)' }}>·</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-px rounded-full font-semibold border ${st.bg} ${st.border} ${st.text}`} style={{ fontSize: 9 }}>
                        {st.icon === 'dot' ? <span className={`w-1 h-1 rounded-full ${st.dotColor}`} style={{ boxShadow: '0 0 4px currentColor' }} /> : <span style={{ opacity: 0.5 }}>—</span>}
                        {st.fullLabel}
                      </span>
                    </>
                  )}
                </div>
                {/* description row ✅ */}
                {previewFile.desc && (
                  <p style={{ margin: 0, fontSize: 10, color: 'rgba(175,195,225,0.7)', lineHeight: 1.5 }}>
                    {previewFile.desc}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}