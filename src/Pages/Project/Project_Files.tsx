/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Film, FileVideo, Search,
  ChevronLeft, ChevronRight,
  Eye, AlertCircle, X, ZoomIn,
} from 'lucide-react';
import Navbar_Project from "../../components/Navbar_Project";
import axios from "axios";
import ENDPOINTS from "../../config";
import PixelLoadingSkeleton from '../../components/PixelLoadingSkeleton';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectFile {
  id: number | string;
  name: string;
  ext: string;
  thumb: string | null;
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

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100, 200];

// Fixed thumbnail cell size (px)
const THUMB_W = 104;
const THUMB_H = 56; // h-14 = 56px

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

const VERSION_STATUS_CLASS: Record<string, string> = {
  wtg:      'bg-gray-700/50 border-gray-600/60 text-gray-400',
  ip:       'bg-blue-900/40 border-blue-700/50 text-blue-300',
  rev:      'bg-amber-900/40 border-amber-700/50 text-amber-400',
  app:      'bg-emerald-900/40 border-emerald-700/50 text-emerald-400',
  approved: 'bg-emerald-900/40 border-emerald-700/50 text-emerald-400',
  pending:  'bg-amber-900/40 border-amber-700/50 text-amber-400',
  rejected: 'bg-red-900/40 border-red-700/50 text-red-400',
};

const VERSION_STATUS_LABEL: Record<string, string> = {
  wtg: 'Waiting',
  ip:  'In Progress',
  rev: 'Review',
  app: 'Approved',
};

const VIDEO_EXT = /^(mp4|webm|mov|avi|mkv|m4v|ogv|flv|wmv|3gp|ts|mts|m2ts)$/;
const IMAGE_EXT = /^(jpg|jpeg|png|gif|webp|bmp|tiff?|svg|avif|heic|heif)$/;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve full thumbnail URL
// ─────────────────────────────────────────────────────────────────────────────

function resolveThumbSrc(thumb: string | null): string | null {
  if (!thumb) return null;
  if (thumb.startsWith('http')) return thumb;
  const base = (ENDPOINTS.image_url ?? '').replace(/\/$/, '');
  return `${base}/${thumb.replace(/^\//, '')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data mapper
// ─────────────────────────────────────────────────────────────────────────────

function mapFile(raw: any): ProjectFile {
  const name: string = raw.file_name ?? raw.name ?? 'Untitled';
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';

  const isMedia = VIDEO_EXT.test(ext) || IMAGE_EXT.test(ext);
  const thumb: string | null =
    raw.thumbnail_url ?? (isMedia ? (raw.download_url ?? null) : null);

  const linked = raw.linked_entity ?? {};
  const linkName: string = linked.name ?? '—';
  const linkStr = linkName.length > 26 ? linkName.slice(0, 24) + '…' : linkName;

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

  return {
    id: raw.id ?? Math.random(),
    name,
    ext,
    thumb,
    link: linkStr,
    linkType: linked.type ?? raw.source ?? '',
    status: ver?.status ?? '',
    desc: raw.description ?? '',
    user,
    date,
    source: raw.source === 'shot' ? 'shot' : 'asset',
    version: versionLabel,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PreviewModal — full-size image/video overlay
// ─────────────────────────────────────────────────────────────────────────────

interface PreviewModalProps {
  file: ProjectFile;
  src: string;
  onClose: () => void;
}

function PreviewModal({ file, src, onClose }: PreviewModalProps) {
  const ext     = file.ext.toLowerCase();
  const isVideo = VIDEO_EXT.test(ext);
  const cacheBusted = src.includes('?') ? `${src}&_cb=1` : `${src}?_cb=1`;

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{ top: 112 }}
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4 rounded-lg overflow-hidden bg-[#1a1d22] border border-gray-700 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700 bg-[#20242a]">
          <span className="text-gray-300 text-xs font-mono truncate max-w-[80%]">{file.name}</span>
          <div
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-700 text-gray-500 hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X size={14} />
          </div>
        </div>

        {/* Media area */}
        <div className="relative min-h-[200px] max-h-[75vh] overflow-hidden flex items-center justify-center bg-[#12151a]">
          {/* blurred background */}
          {isVideo ? (
            <video
              src={cacheBusted}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px)', transform: 'scale(1.1)', opacity: 0.5 }}
              muted loop autoPlay playsInline
              aria-hidden
            />
          ) : (
            <img
              src={cacheBusted}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px)', transform: 'scale(1.1)', opacity: 0.5 }}
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
          {/* actual media — contain */}
          {isVideo ? (
            <video
              src={cacheBusted}
              className="relative z-10 max-w-full max-h-[75vh] object-contain"
              controls autoPlay muted loop playsInline
            />
          ) : (
            <img
              src={cacheBusted}
              alt={file.name}
              className="relative z-10 max-w-full max-h-[75vh] object-contain"
            />
          )}
        </div>

        {/* Footer metadata */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-gray-700 bg-[#20242a] text-[11px] text-gray-500">
          <span>{file.user}</span>
          <span>·</span>
          <span>{file.date}</span>
          {file.status && (
            <>
              <span>·</span>
              <span className={`px-1.5 py-px rounded border text-[10px] font-semibold
                ${VERSION_STATUS_CLASS[file.status.toLowerCase()] ?? 'bg-gray-700/40 border-gray-600 text-gray-400'}`}
              >
                {VERSION_STATUS_LABEL[file.status.toLowerCase()] ?? file.status}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ThumbCell — fixed-size thumbnail, blur fallback on error, click to preview
// ─────────────────────────────────────────────────────────────────────────────

interface ThumbCellProps {
  file: ProjectFile;
  onPreview: () => void;
}

function ThumbCell({ file, onPreview }: ThumbCellProps) {
  const [failed, setFailed] = useState(false);

  const ext     = file.ext.toLowerCase();
  const isImage = IMAGE_EXT.test(ext);
  const isVideo = VIDEO_EXT.test(ext);
  const src     = resolveThumbSrc(file.thumb);

  const fixedSize = { width: THUMB_W, height: THUMB_H, minWidth: THUMB_W, minHeight: THUMB_H };

  // ── No source / non-media type ─────────────────────────────────────────
  if (!src || (!isImage && !isVideo)) {
    return (
      <div style={fixedSize} className="rounded bg-[#15181c] border border-gray-700 flex flex-col items-center justify-center gap-1 shrink-0">
        {isVideo
          ? <Film      size={18} className="text-sky-800" />
          : <FileVideo size={18} className="text-gray-600" />}
        {ext && <span className="text-[9px] uppercase tracking-widest text-gray-600">{ext}</span>}
      </div>
    );
  }

  // ── Load failed → blurred placeholder ────────────────────────────────
  if (failed) {
    return (
      <div style={fixedSize} className="rounded border border-gray-700 flex flex-col items-center justify-center gap-1 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700/40 to-gray-800/60 backdrop-blur-md" />
        <div className="relative z-10 flex flex-col items-center gap-1">
          <FileVideo size={16} className="text-gray-500" />
          <span className="text-[9px] text-gray-500 uppercase tracking-widest">no preview</span>
        </div>
      </div>
    );
  }

  const cacheBusted = src.includes('?') ? `${src}&_cb=1` : `${src}?_cb=1`;

  // ── Clickable media thumbnail ─────────────────────────────────────────
  return (
    <div
      style={fixedSize}
      className="rounded border border-gray-700 overflow-hidden shrink-0 relative group cursor-pointer"
      onClick={e => { e.stopPropagation(); onPreview(); }}
    >
      {/* blurred background layer — stretched cover */}
      {isVideo ? (
        <video
          src={cacheBusted}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px)', transform: 'scale(1.1)', display: 'block' }}
          muted loop autoPlay playsInline preload="auto"
          aria-hidden
        />
      ) : (
        <img
          src={cacheBusted}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px)', transform: 'scale(1.1)', display: 'block' }}
          aria-hidden
        />
      )}
      {/* dark tint on top of blur */}
      <div className="absolute inset-0 bg-black/30" />
      {/* actual media — contain (show full) */}
      {isVideo ? (
        <video
          src={cacheBusted}
          style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          muted loop autoPlay playsInline preload="auto"
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={cacheBusted}
          alt="thumb"
          style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          onError={() => setFailed(true)}
        />
      )}
      {/* hover overlay with zoom icon */}
      <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
        <ZoomIn size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable UI components
// ─────────────────────────────────────────────────────────────────────────────

function FileIcon({ ext }: { ext: string }) {
  const cls = EXT_CLASS[ext] ?? 'bg-gray-500/10 border border-gray-500/30 text-gray-400';
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded shrink-0 ${cls}`}>
      <Film size={11} />
    </span>
  );
}

function TabBtn({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-colors border
        ${active
          ? 'bg-blue-900/40 border-blue-600 text-blue-300'
          : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
        }`}
    >
      {label}
      <span className={`px-1.5 py-px rounded-full text-[10px] ${active ? 'bg-blue-700/60 text-blue-200' : 'bg-gray-700 text-gray-400'}`}>
        {count}
      </span>
    </button>
  );
}

function Th({ children, onClick, sortable }: {
  children?: React.ReactNode; onClick?: () => void; sortable?: boolean;
}) {
  return (
    <th
      onClick={onClick}
      className={`px-2.5 py-1.5 text-left font-semibold text-gray-500 text-[11px] tracking-wide whitespace-nowrap select-none
        ${sortable ? 'cursor-pointer hover:text-gray-300' : 'cursor-default'}`}
    >
      {children}
    </th>
  );
}

function PagBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[26px] h-6 px-1.5 flex items-center justify-center rounded text-[11px] border transition-colors
        ${active   ? 'border-blue-500 bg-blue-900/40 text-blue-300' : 'border-gray-600 bg-transparent text-gray-500 hover:text-gray-300'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectFiles() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [assetFiles, setAssetFiles] = useState<ProjectFile[]>([]);
  const [shotFiles,  setShotFiles]  = useState<ProjectFile[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);
  const [pageSize,  setPageSize]  = useState(25);
  const [sortCol,   setSortCol]   = useState<keyof ProjectFile>('date');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('desc');

  // Preview modal state
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  const [previewSrc,  setPreviewSrc]  = useState<string>('');

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
          projectId =
            pd.projectId ?? pd.id ??
            pd.projectInfo?.project?.id ??
            pd.projectInfo?.projects?.[0]?.id ?? null;
        }

        const url = projectId
          ? `${ENDPOINTS.ALL_PROJECT_FILES}?project_id=${projectId}`
          : ENDPOINTS.ALL_PROJECT_FILES;

        const res  = await axios.post(url);
        const data = res.data ?? {};

        setAssetFiles((data.asset_files ?? []).map(mapFile));
        setShotFiles((data.shot_files   ?? []).map(mapFile));
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setAssetFiles([]);
          setShotFiles([]);
        } else {
          setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load files');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const allFiles = [...assetFiles, ...shotFiles];

  const tabFiles: Record<TabKey, ProjectFile[]> = {
    all:   allFiles,
    asset: assetFiles,
    shot:  shotFiles,
  };

  const filtered = tabFiles[activeTab].filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.user.toLowerCase().includes(search.toLowerCase()) ||
    f.link.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const va = String(a[sortCol] ?? '');
    const vb = String(b[sortCol] ?? '');
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const total      = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged      = sorted.slice((page - 1) * pageSize, page * pageSize);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSort = (col: keyof ProjectFile) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  const openPreview = (file: ProjectFile) => {
    const src = resolveThumbSrc(file.thumb);
    if (!src) return;
    setPreviewFile(file);
    setPreviewSrc(src);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewSrc('');
  };

  // ── Sort arrow helper ──────────────────────────────────────────────────────
  const Arrow = ({ col }: { col: keyof ProjectFile }) =>
    sortCol === col
      ? <span className="ml-1 opacity-80">{sortDir === 'asc' ? '↑' : '↓'}</span>
      : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-900">

      {/* Navbar */}
      <div className="pt-14">
        <Navbar_Project activeTab="other" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 border-b border-gray-700 bg-[#20242a] shrink-0 pt-14">
        <TabBtn label="All"    count={allFiles.length}   active={activeTab === 'all'}   onClick={() => handleTabChange('all')} />
        <TabBtn label="Assets" count={assetFiles.length} active={activeTab === 'asset'} onClick={() => handleTabChange('asset')} />
        <TabBtn label="Shots"  count={shotFiles.length}  active={activeTab === 'shot'}  onClick={() => handleTabChange('shot')} />

        <div className="flex-1" />

        {/* Search */}
        <div className="flex items-center gap-1.5 bg-[#15181c] border border-gray-700 rounded px-2.5 py-1 w-48">
          <Search size={12} className="text-gray-600 shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search Files…"
            className="bg-transparent border-none outline-none text-[#cdd1d8] text-xs w-full placeholder-gray-600 font-mono"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">

        {/* Loading */}
        {loading && <PixelLoadingSkeleton />}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-red-400">
            <AlertCircle size={28} />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="mt-1 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs border-none cursor-pointer transition-colors font-mono"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && allFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-gray-600">
            <FileVideo size={36} className="text-gray-700" />
            <span className="text-sm text-gray-500">No files found for this project</span>
          </div>
        )}

        {/* Table */}
        {!loading && !error && allFiles.length > 0 && (
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            {/* col order: file name | thumbnail | links | status | description | created by | date */}
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: 120 }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: 80 }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: 148 }} />
            </colgroup>

            <thead>
              <tr className="bg-[#20242a] border-b-2 border-gray-700 sticky top-0 z-10">
                <Th onClick={() => handleSort('name')} sortable>File <Arrow col="name" /></Th>
                <Th>Thumbnail</Th>
                <Th>Links</Th>
                <Th onClick={() => handleSort('status')} sortable>Status <Arrow col="status" /></Th>
                <Th>Description</Th>
                <Th onClick={() => handleSort('user')} sortable>Created by <Arrow col="user" /></Th>
                <Th onClick={() => handleSort('date')} sortable>Date Created <Arrow col="date" /></Th>
              </tr>
            </thead>

            <tbody>
              {paged.map((file, i) => {
                const rowBase = i % 2 === 0 ? 'bg-[#1c1f23]' : 'bg-[#1e2227]';

                return (
                  <tr
                    key={`${file.source}-${file.id}`}
                    className={`${rowBase} border-b border-gray-800 hover:bg-[#252b33] transition-colors`}
                  >

                    {/* File name */}
                    <td className="px-2.5 py-2 align-middle">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileIcon ext={file.ext} />
                        <span className="text-[#5b9cf6] text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                          {file.name}
                        </span>
                      </div>
                    </td>

                    {/* Thumbnail — click to preview */}
                    <td className="px-2.5 py-1.5 align-middle">
                      <ThumbCell file={file} onPreview={() => openPreview(file)} />
                    </td>

                    {/* Links */}
                    <td className="px-2.5 py-2 align-middle">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-5 h-5 rounded shrink-0 bg-[#2a2f38] border border-gray-700 flex items-center justify-center">
                          <Film size={10} className="text-gray-400" />
                        </div>
                        <span className="text-[#5b9cf6] text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                          {file.link || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-2.5 py-2 align-middle">
                      {file.status ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold whitespace-nowrap
                          ${VERSION_STATUS_CLASS[file.status.toLowerCase()] ?? 'bg-gray-700/40 border-gray-600 text-gray-400'}`}
                        >
                          {VERSION_STATUS_LABEL[file.status.toLowerCase()] ?? file.status}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="px-2.5 py-2 align-middle">
                      <span className={`block text-xs overflow-hidden text-ellipsis whitespace-nowrap
                        ${file.desc ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {file.desc || ''}
                      </span>
                    </td>

                    {/* Created by */}
                    <td className="px-2.5 py-2 align-middle">
                      <div className="flex items-center gap-1.5">
                        <div className="w-[18px] h-[18px] rounded-full shrink-0 bg-blue-900/50 flex items-center justify-center">
                          <Eye size={9} className="text-blue-300" />
                        </div>
                        <span className="text-[#5b9cf6] text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                          {file.user}
                        </span>
                      </div>
                    </td>

                    {/* Date Created */}
                    <td className="px-2.5 py-2 align-middle">
                      <span className="text-gray-400 text-xs whitespace-nowrap">{file.date}</span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination footer */}
      {!loading && !error && allFiles.length > 0 && (
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-700 bg-[#20242a] shrink-0 text-[11px] text-gray-500">

          {/* Left: count */}
          <span>
            {total === 0 ? '0' : `${(page - 1) * pageSize + 1} – ${Math.min(page * pageSize, total)}`} of {total} Files
          </span>

          {/* Right: page size + page navigation */}
          <div className="flex items-center gap-2.5">

            {/* Rows per page */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600">Rows:</span>
              <div className="flex items-center gap-0.5 border border-gray-700 rounded overflow-hidden">
                {PAGE_SIZE_OPTIONS.map(size => (
                  <button
                    key={size}
                    onClick={() => { setPageSize(size); setPage(1); }}
                    className={`px-2 py-0.5 text-[11px] transition-colors border-none cursor-pointer
                      ${pageSize === size
                        ? 'bg-blue-900/50 text-blue-300'
                        : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-700/40'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Page buttons */}
            <div className="flex items-center gap-0.5">
              <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={13} />
              </PagBtn>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                const p = totalPages > 7 ? start + i : i + 1;
                return (
                  <PagBtn key={p} onClick={() => setPage(p)} active={p === page}>
                    {p}
                  </PagBtn>
                );
              })}
              <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={13} />
              </PagBtn>
            </div>

          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewFile && previewSrc && (
        <PreviewModal file={previewFile} src={previewSrc} onClose={closePreview} />
      )}

    </div>
  );
}