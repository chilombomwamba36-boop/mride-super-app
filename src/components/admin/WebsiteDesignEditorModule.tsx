import React, { useState } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Monitor,
  Tablet,
  Smartphone,
  History,
  Send,
  CheckCircle2,
  Globe2,
  RotateCcw,
  Upload,
  Lock,
  Sparkles,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import {
  WebsiteCmsAndWorkforceService,
  WebsitePageSlug,
  WebsiteSnapshotVersion,
  WebsiteMediaAsset,
  WebsitePublishingPermissions
} from '../../services/websiteCmsService';
import { AdminStaffRole } from '../../services/mridePlatformStore';
import { TripSecurityAndStateService } from '../../services/tripStateMachine';

interface WebsiteDesignEditorModuleProps {
  actorName: string;
  actorRole: AdminStaffRole;
  onNotice: (msg: string) => void;
}

const EDITABLE_PAGE_LIST: Array<{ slug: WebsitePageSlug; label: string }> = [
  { slug: 'home', label: 'Homepage' },
  { slug: 'rides', label: 'Rides Page' },
  { slug: 'cargo', label: 'Cargo Page' },
  { slug: 'boda', label: 'Boda Delivery Page' },
  { slug: 'fairfare', label: 'FairFare Page' },
  { slug: 'food', label: 'Food Delivery Page' },
  { slug: 'marketplace', label: 'Marketplace Page' },
  { slug: 'corporate', label: 'Corporate Services Page' },
  { slug: 'about', label: 'About Us Page' },
  { slug: 'faqs', label: 'FAQs & Safety Page' },
  { slug: 'contact', label: 'Contact & Help Page' }
];

export const WebsiteDesignEditorModule: React.FC<WebsiteDesignEditorModuleProps> = ({
  actorName,
  actorRole,
  onNotice
}) => {
  const [draft, setDraft] = useState<WebsiteSnapshotVersion>(() =>
    WebsiteCmsAndWorkforceService.getWorkingDraftSnapshot()
  );
  const [publishedVersion, setPublishedVersion] = useState<WebsiteSnapshotVersion>(() =>
    WebsiteCmsAndWorkforceService.getPublishedWebsiteSnapshot()
  );
  const [versionHistory, setVersionHistory] = useState<WebsiteSnapshotVersion[]>(() =>
    WebsiteCmsAndWorkforceService.getVersionHistory()
  );
  const [mediaAssets, setMediaAssets] = useState<WebsiteMediaAsset[]>(() =>
    WebsiteCmsAndWorkforceService.getMediaLibrary()
  );
  const [pubPerms, setPubPerms] = useState<WebsitePublishingPermissions>(() =>
    WebsiteCmsAndWorkforceService.getPublishingPermissions()
  );

  const [selectedPageSlug, setSelectedPageSlug] = useState<WebsitePageSlug>('home');
  const [editorSubTab, setEditorSubTab] = useState<
    'page_editor' | 'theme_design' | 'media_manager' | 'publishing_versions'
  >('page_editor');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [changeSummaryInput, setChangeSummaryInput] = useState(
    'Updated website banners, headings, and Corporate Services section'
  );

  // Media Upload & Resize/Crop Controls
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaCategory, setNewMediaCategory] =
    useState<WebsiteMediaAsset['category']>('Hero Banner');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaWidth, setNewMediaWidth] = useState<number>(1200);
  const [newMediaHeight, setNewMediaHeight] = useState<number>(675);
  const [newMediaCrop, setNewMediaCrop] = useState<'cover' | 'contain' | 'center'>('cover');
  const [newBulletText, setNewBulletText] = useState('');

  const isOwner = actorRole === 'Owner / Super Administrator';
  const activePageConfig = draft.pages[selectedPageSlug] || draft.pages.home;

  const updateCurrentPageField = <K extends keyof typeof activePageConfig>(
    key: K,
    value: (typeof activePageConfig)[K]
  ) => {
    const nextDraft: WebsiteSnapshotVersion = {
      ...draft,
      status: 'Draft',
      pages: {
        ...draft.pages,
        [selectedPageSlug]: {
          ...activePageConfig,
          [key]: value
        }
      }
    };
    setDraft(nextDraft);
  };

  const handleSaveDraft = () => {
    try {
      const saved = WebsiteCmsAndWorkforceService.saveWorkingDraft(
        draft,
        actorName,
        actorRole,
        changeSummaryInput
      );
      setDraft(saved);
      TripSecurityAndStateService.recordAuditLog({
        actorId: actorName,
        actorName,
        actorRole: 'admin',
        action: `Saved Website Draft (${selectedPageSlug.toUpperCase()})`,
        category: 'fare_config',
        targetId: selectedPageSlug,
        summary: changeSummaryInput
      });
      onNotice(`Draft saved for "${activePageConfig.pageTitle}" (Status: Draft).`);
    } catch (err) {
      onNotice((err as Error).message);
    }
  };

  const handlePreviewStep = () => {
    const updated = WebsiteCmsAndWorkforceService.markDraftPreviewed(draft);
    setDraft(updated);
    onNotice('Draft marked as Previewed across Desktop, Tablet & Mobile viewports.');
  };

  const handleSubmitForApproval = () => {
    const res = WebsiteCmsAndWorkforceService.submitDraftForApproval(
      draft,
      actorName,
      actorRole,
      changeSummaryInput
    );
    if (!res.success || !res.snapshot) {
      onNotice(res.message);
      return;
    }
    setDraft(res.snapshot);
    setVersionHistory(WebsiteCmsAndWorkforceService.getVersionHistory());
    TripSecurityAndStateService.recordAuditLog({
      actorId: actorName,
      actorName,
      actorRole: 'admin',
      action: `Submitted Website Version v${res.snapshot.versionNumber} for Approval`,
      category: 'fare_config',
      targetId: res.snapshot.versionId,
      summary: res.snapshot.changeSummary
    });
    onNotice(res.message);
  };

  const handleApproveVersion = () => {
    const res = WebsiteCmsAndWorkforceService.approveSubmittedWebsiteVersion(
      draft,
      actorName,
      actorRole
    );
    if (!res.success || !res.snapshot) {
      onNotice(res.message);
      return;
    }
    setDraft(res.snapshot);
    setVersionHistory(WebsiteCmsAndWorkforceService.getVersionHistory());
    TripSecurityAndStateService.recordAuditLog({
      actorId: actorName,
      actorName,
      actorRole: 'admin',
      action: `Approved Website Version v${res.snapshot.versionNumber}`,
      category: 'fare_config',
      targetId: res.snapshot.versionId,
      summary: `Approved by ${actorName} (${actorRole})`
    });
    onNotice(res.message);
  };

  const handlePublishLive = () => {
    const res = WebsiteCmsAndWorkforceService.publishApprovedWebsiteVersion(
      draft,
      actorName,
      actorRole
    );
    if (!res.success || !res.snapshot) {
      onNotice(res.message);
      return;
    }
    setDraft(res.snapshot);
    setPublishedVersion(res.snapshot);
    setVersionHistory(WebsiteCmsAndWorkforceService.getVersionHistory());
    TripSecurityAndStateService.recordAuditLog({
      actorId: actorName,
      actorName,
      actorRole: 'admin',
      action: `Published Website Version v${res.snapshot.versionNumber} LIVE`,
      category: 'fare_config',
      targetId: res.snapshot.versionId,
      summary: `Published live to public Mride website. Passenger & Driver apps untouched.`
    });
    onNotice(res.message);
  };

  const handleRollbackVersion = (versionId: string) => {
    const res = WebsiteCmsAndWorkforceService.rollbackToVersion(versionId, actorName, actorRole);
    if (!res.success || !res.snapshot) {
      onNotice(res.message);
      return;
    }
    setDraft(res.snapshot);
    setPublishedVersion(res.snapshot);
    setVersionHistory(WebsiteCmsAndWorkforceService.getVersionHistory());
    TripSecurityAndStateService.recordAuditLog({
      actorId: actorName,
      actorName,
      actorRole: 'admin',
      action: `Rolled Back Public Website to v${res.snapshot.versionNumber}`,
      category: 'fare_config',
      targetId: versionId,
      summary: res.snapshot.changeSummary
    });
    onNotice(res.message);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewMediaUrl(reader.result);
        if (!newMediaTitle.trim()) {
          setNewMediaTitle(file.name.replace(/\.[^.]+$/, ''));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddMediaAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim() || !newMediaUrl.trim()) return;
    const created: WebsiteMediaAsset = {
      id: `med_${Date.now()}`,
      title: newMediaTitle.trim(),
      category: newMediaCategory,
      dataUrl: newMediaUrl.trim(),
      widthPx: newMediaWidth,
      heightPx: newMediaHeight,
      cropMode: newMediaCrop,
      uploadedBy: `${actorName} (${actorRole})`,
      uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    const next = [created, ...mediaAssets];
    setMediaAssets(next);
    WebsiteCmsAndWorkforceService.saveMediaLibrary(next);
    setNewMediaTitle('');
    setNewMediaUrl('');
    onNotice(`Uploaded & formatted image "${created.title}" (${created.widthPx}×${created.heightPx}px, ${created.cropMode}).`);
  };

  return (
    <div className="space-y-5 text-xs">
      {/* ================= TOP PUBLISHING PIPELINE BAR (Draft → Preview → Submitted → Approved → Published) ================= */}
      <div className="bg-[#0B1528] text-white rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#FF6500] text-white px-2.5 py-0.5 rounded-full">
              <Palette className="w-3 h-3" /> Website-Only Visual Design Editor & Publishing Pipeline
            </span>
            <h2 className="text-lg font-extrabold mt-1">
              No-Code Public Website Editor, Media Manager & Version Control
            </h2>
            <p className="text-xs text-slate-300">
              Edit all 11 public website pages, upload/crop banners, preview across Desktop/Tablet/Mobile, and publish through the 5-stage approval pipeline. <strong>Does not alter the Passenger or Driver mobile apps.</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Live Public Website Version
            </span>
            <strong className="text-sm text-emerald-400 font-mono">
              v{publishedVersion.versionNumber} ({publishedVersion.status})
            </strong>
            <span className="block text-[10px] text-slate-400">
              Working Draft Status: <strong className="text-[#FF6500]">{draft.status}</strong>
            </span>
          </div>
        </div>

        {/* 5-Stage Workflow Stepper & Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/10">
          {(['Draft', 'Preview', 'Submitted for Approval', 'Approved', 'Published'] as const).map(
            (step, idx) => {
              const active = draft.status === step;
              return (
                <div
                  key={step}
                  className={`p-2.5 rounded-xl border text-center ${
                    active
                      ? 'border-[#FF6500] bg-[#FF6500]/20 text-white font-extrabold'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-mono block text-slate-400">STAGE {idx + 1}</span>
                  <span className="text-xs">{step}</span>
                </div>
              );
            }
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <input
            type="text"
            value={changeSummaryInput}
            onChange={(e) => setChangeSummaryInput(e.target.value)}
            placeholder="Describe your website changes for the approval & version log..."
            className="flex-1 min-w-[240px] rounded-xl bg-white/10 border border-white/20 px-3.5 py-2 text-xs text-white placeholder-slate-400"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold px-3.5 py-2"
            >
              1. Save Draft
            </button>
            <button
              type="button"
              onClick={handlePreviewStep}
              className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold px-3.5 py-2 flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> 2. Preview
            </button>
            <button
              type="button"
              onClick={handleSubmitForApproval}
              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3.5 py-2 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> 3. Submit for Approval
            </button>
            <button
              type="button"
              onClick={handleApproveVersion}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-2 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> 4. Approve
            </button>
            <button
              type="button"
              onClick={handlePublishLive}
              className="rounded-xl bg-[#FF6500] hover:bg-[#e55a00] text-white font-extrabold px-4 py-2 flex items-center gap-1.5 shadow-md"
            >
              <Globe2 className="w-3.5 h-3.5" /> 5. Publish to Website
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          {([
            { id: 'page_editor', label: 'Page Content & Sections (11 Pages)', icon: Globe2 },
            { id: 'theme_design', label: 'Colours, Fonts, Logo & Layout', icon: Palette },
            { id: 'media_manager', label: `Media & Image Library (${mediaAssets.length})`, icon: ImageIcon },
            { id: 'publishing_versions', label: `Version History & Rollback (${versionHistory.length})`, icon: History }
          ] as const).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setEditorSubTab(t.id)}
                className={`px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-1.5 transition-all ${
                  editorSubTab === t.id
                    ? 'bg-[#0B1528] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#FF6500]" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Responsive Preview Size Selector */}
        <div className="flex items-center gap-1 bg-[#F4F6F9] p-1 rounded-xl border border-slate-200">
          {([
            { id: 'desktop', label: 'Desktop', icon: Monitor },
            { id: 'tablet', label: 'Tablet', icon: Tablet },
            { id: 'mobile', label: 'Mobile Web', icon: Smartphone }
          ] as const).map((vp) => {
            const Icon = vp.icon;
            return (
              <button
                key={vp.id}
                type="button"
                onClick={() => setPreviewViewport(vp.id)}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                  previewViewport === vp.id
                    ? 'bg-white text-[#FF6500] shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{vp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: PAGE CONTENT & VISUAL LIVE PREVIEW ================= */}
      {editorSubTab === 'page_editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Page Selector & Field Editor */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1.5">
                Select Public Website Page to Edit:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EDITABLE_PAGE_LIST.map((pg) => (
                  <button
                    key={pg.slug}
                    type="button"
                    onClick={() => setSelectedPageSlug(pg.slug)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all ${
                      selectedPageSlug === pg.slug
                        ? 'bg-[#FF6500] text-white shadow-2xs'
                        : 'bg-[#F4F6F9] text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-600 block mb-1">Hero Main Heading</label>
                <input
                  type="text"
                  value={activePageConfig.heroHeading}
                  onChange={(e) => updateCurrentPageField('heroHeading', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-extrabold text-sm text-[#15191C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-600 block mb-1">Hero Subheading Paragraph</label>
                <textarea
                  rows={2}
                  value={activePageConfig.heroSubheading}
                  onChange={(e) => updateCurrentPageField('heroSubheading', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Primary Button Text</label>
                <input
                  type="text"
                  value={activePageConfig.primaryCtaText}
                  onChange={(e) => updateCurrentPageField('primaryCtaText', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Secondary Button Text</label>
                <input
                  type="text"
                  value={activePageConfig.secondaryCtaText}
                  onChange={(e) => updateCurrentPageField('secondaryCtaText', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-600 block mb-1">
                  Page Hero Picture / Banner URL (or pick from Media Library)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activePageConfig.bannerImageUrl}
                    onChange={(e) => updateCurrentPageField('bannerImageUrl', e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 font-mono text-[11px]"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) updateCurrentPageField('bannerImageUrl', e.target.value);
                    }}
                    value=""
                    className="rounded-xl border border-slate-300 bg-[#F4F6F9] px-2.5 py-2 font-bold"
                  >
                    <option value="">Pick Saved Image...</option>
                    {mediaAssets.map((m) => (
                      <option key={m.id} value={m.dataUrl}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-600 block mb-1">Main Section Heading</label>
                <input
                  type="text"
                  value={activePageConfig.sectionHeading}
                  onChange={(e) => updateCurrentPageField('sectionHeading', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-600 block mb-1">Section Body Copy</label>
                <textarea
                  rows={3}
                  value={activePageConfig.sectionBody}
                  onChange={(e) => updateCurrentPageField('sectionBody', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-600 block mb-1">Promotional Callout Strip</label>
                <input
                  type="text"
                  value={activePageConfig.promoBannerText}
                  onChange={(e) => updateCurrentPageField('promoBannerText', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-[#FF6500]"
                />
              </div>
            </div>

            {/* Feature Bullets List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-600">Page Feature Highlights / FAQ Items</label>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activePageConfig.visibleInNavbar}
                    onChange={(e) =>
                      updateCurrentPageField('visibleInNavbar', e.target.checked)
                    }
                    className="accent-[#FF6500]"
                  />
                  <span>Show in Top Public Navbar</span>
                </label>
              </div>

              {activePageConfig.featureBullets.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={b}
                    onChange={(e) => {
                      const next = [...activePageConfig.featureBullets];
                      next[i] = e.target.value;
                      updateCurrentPageField('featureBullets', next);
                    }}
                    className="flex-1 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentPageField(
                        'featureBullets',
                        activePageConfig.featureBullets.filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBulletText}
                  onChange={(e) => setNewBulletText(e.target.value)}
                  placeholder="Add new highlight or FAQ item..."
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newBulletText.trim()) return;
                    updateCurrentPageField('featureBullets', [
                      ...activePageConfig.featureBullets,
                      newBulletText.trim()
                    ]);
                    setNewBulletText('');
                  }}
                  className="rounded-xl bg-[#0B1528] text-white font-bold px-3 py-1.5 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Responsive Preview Canvas (Desktop / Tablet / Mobile Web) */}
          <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-white pb-3 mb-3 border-b border-white/10">
              <span className="font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF6500]" />
                Live Responsive Website Preview ({activePageConfig.pageTitle})
              </span>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded">
                Viewport: {previewViewport.toUpperCase()}
              </span>
            </div>

            <div
              className={`rounded-2xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-300 ${
                previewViewport === 'mobile'
                  ? 'w-[340px]'
                  : previewViewport === 'tablet'
                  ? 'w-[520px] max-w-full'
                  : 'w-full'
              }`}
              style={{
                backgroundColor: draft.theme.backgroundLightHex,
                fontFamily: draft.theme.headingFontFamily
              }}
            >
              {/* Simulated Top Announcement */}
              {draft.theme.showAnnouncementBar && (
                <div
                  className="px-3 py-1.5 text-[10px] font-bold text-white text-center"
                  style={{ backgroundColor: draft.theme.primaryColorHex }}
                >
                  {draft.theme.announcementBarText}
                </div>
              )}

              {/* Simulated Public Navbar (Notice: ZERO admin links!) */}
              <div
                className="px-4 py-2.5 text-white flex items-center justify-between"
                style={{ backgroundColor: draft.theme.secondaryNavyHex }}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={draft.theme.brandLogoUrl}
                    alt="Mride"
                    className="w-6 h-6 rounded-md bg-white/10"
                  />
                  <span className="font-extrabold text-sm">Mride</span>
                </div>
                <span
                  className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: draft.theme.primaryColorHex }}
                >
                  {activePageConfig.primaryCtaText}
                </span>
              </div>

              {/* Hero Preview */}
              <div className="relative h-48 overflow-hidden bg-slate-950 text-white">
                <img
                  src={activePageConfig.bannerImageUrl}
                  alt={activePageConfig.pageTitle}
                  className="w-full h-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent p-5 flex flex-col justify-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                    Mride Zambia • {activePageConfig.pageTitle}
                  </span>
                  <h4 className="text-lg font-black leading-tight mt-1">
                    {activePageConfig.heroHeading}
                  </h4>
                  <p className="text-[11px] text-slate-200 mt-1 line-clamp-2">
                    {activePageConfig.heroSubheading}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span
                      className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: draft.theme.primaryColorHex }}
                    >
                      {activePageConfig.primaryCtaText}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white/15 text-white">
                      {activePageConfig.secondaryCtaText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Preview */}
              <div className="p-4 space-y-3 text-[#15191C]">
                <div
                  className="p-3 rounded-xl border border-slate-200 space-y-1.5"
                  style={{ backgroundColor: draft.theme.surfaceCardHex }}
                >
                  <h5 className="font-extrabold text-sm">{activePageConfig.sectionHeading}</h5>
                  <p className="text-[11px] text-slate-600">{activePageConfig.sectionBody}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activePageConfig.featureBullets.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-200 text-[11px] font-bold flex items-start gap-1.5"
                      style={{ backgroundColor: draft.theme.surfaceCardHex }}
                    >
                      <CheckCircle2
                        className="w-3.5 h-3.5 shrink-0 mt-0.5"
                        style={{ color: draft.theme.primaryColorHex }}
                      />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: APPROVED COLOURS, FONTS, LOGO & LAYOUT ================= */}
      {editorSubTab === 'theme_design' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
          <h3 className="text-base font-extrabold text-[#15191C]">
            Approved Website Colours, Typography, Logo & Layout Controls
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Primary Brand Colour</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.theme.primaryColorHex}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      theme: { ...draft.theme, primaryColorHex: e.target.value }
                    })
                  }
                  className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={draft.theme.primaryColorHex}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      theme: { ...draft.theme, primaryColorHex: e.target.value }
                    })
                  }
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Navbar Dark Navy Hex</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.theme.secondaryNavyHex}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      theme: { ...draft.theme, secondaryNavyHex: e.target.value }
                    })
                  }
                  className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={draft.theme.secondaryNavyHex}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      theme: { ...draft.theme, secondaryNavyHex: e.target.value }
                    })
                  }
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Page Background Colour</label>
              <input
                type="text"
                value={draft.theme.backgroundLightHex}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    theme: { ...draft.theme, backgroundLightHex: e.target.value }
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Approved Typography</label>
              <select
                value={draft.theme.headingFontFamily}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    theme: {
                      ...draft.theme,
                      headingFontFamily: e.target.value as typeof draft.theme.headingFontFamily
                    }
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
              >
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Mride Default)</option>
                <option value="Inter">Inter Modern Sans</option>
                <option value="System Sans">System Clean Sans</option>
                <option value="Georgia Serif">Executive Editorial Serif</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-600 block mb-1">Official Website Logo URL</label>
              <input
                type="text"
                value={draft.theme.brandLogoUrl}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    theme: { ...draft.theme, brandLogoUrl: e.target.value }
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-600 block mb-1">Top Website Announcement Ribbon</label>
              <input
                type="text"
                value={draft.theme.announcementBarText}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    theme: { ...draft.theme, announcementBarText: e.target.value }
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MEDIA & IMAGE MANAGEMENT (UPLOAD, RESIZE, CROP) ================= */}
      {editorSubTab === 'media_manager' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddMediaAsset}
            className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3"
          >
            <h3 className="text-base font-extrabold text-[#15191C]">
              Upload, Replace, Crop, Resize & Organise Website Images
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Image Title</label>
                <input
                  type="text"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  placeholder="e.g. Kitwe Cargo Fleet"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">Category</label>
                <select
                  value={newMediaCategory}
                  onChange={(e) =>
                    setNewMediaCategory(e.target.value as WebsiteMediaAsset['category'])
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                >
                  <option value="Hero Banner">Hero Banner</option>
                  <option value="Service Card">Service Card</option>
                  <option value="Logo & Brand">Logo & Brand</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Corporate & Team">Corporate & Team</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">Upload File or Paste URL</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="https://... or upload"
                    className="flex-1 rounded-xl border border-slate-300 px-2.5 py-2 font-mono text-[11px]"
                  />
                  <label className="rounded-xl bg-slate-100 hover:bg-slate-200 px-2.5 py-2 cursor-pointer flex items-center">
                    <Upload className="w-4 h-4 text-[#FF6500]" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">Resize (W × H px)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={newMediaWidth}
                    onChange={(e) => setNewMediaWidth(Number(e.target.value))}
                    className="w-20 rounded-xl border border-slate-300 px-2 py-2 font-mono"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={newMediaHeight}
                    onChange={(e) => setNewMediaHeight(Number(e.target.value))}
                    className="w-20 rounded-xl border border-slate-300 px-2 py-2 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">Crop Mode</label>
                <select
                  value={newMediaCrop}
                  onChange={(e) =>
                    setNewMediaCrop(e.target.value as 'cover' | 'contain' | 'center')
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                >
                  <option value="cover">Cover (Fill Frame)</option>
                  <option value="contain">Contain (Full Fit)</option>
                  <option value="center">Center Focus</option>
                </select>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#FF6500] hover:bg-[#e55a00] text-white font-extrabold py-2.5 px-4"
              >
                + Save to Library
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mediaAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
              >
                <div className="h-36 bg-slate-900 relative overflow-hidden">
                  <img
                    src={asset.dataUrl}
                    alt={asset.title}
                    className={`w-full h-full ${
                      asset.cropMode === 'contain' ? 'object-contain p-2' : 'object-cover'
                    }`}
                  />
                  <span className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {asset.category}
                  </span>
                </div>
                <div className="p-3.5 space-y-2">
                  <strong className="text-[#15191C] block truncate">{asset.title}</strong>
                  <p className="text-[10px] text-slate-400">
                    {asset.widthPx}×{asset.heightPx}px • Crop: {asset.cropMode} • {asset.uploadedBy}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      updateCurrentPageField('bannerImageUrl', asset.dataUrl);
                      setEditorSubTab('page_editor');
                      onNotice(`Applied "${asset.title}" to ${activePageConfig.pageTitle} banner!`);
                    }}
                    className="w-full rounded-xl bg-[#0B1528] hover:bg-[#FF6500] text-white font-extrabold py-1.5 text-[11px] transition-colors"
                  >
                    Use on {activePageConfig.pageTitle}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: VERSION HISTORY, ROLLBACK & OWNER PUBLISHING PERMISSIONS ================= */}
      {editorSubTab === 'publishing_versions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Version History & 1-Click Rollback */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
            <h3 className="text-base font-extrabold text-[#15191C]">
              Website Version History & Instant Rollback ({versionHistory.length})
            </h3>
            <p className="text-xs text-slate-500">
              Review earlier website snapshots and restore any previous version immediately if an update causes problems.
            </p>
            <div className="space-y-2.5">
              {versionHistory.map((ver) => (
                <div
                  key={ver.versionId}
                  className="p-3.5 rounded-2xl bg-[#F4F6F9] border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs bg-[#0B1528] text-white px-2 py-0.5 rounded">
                        v{ver.versionNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                        {ver.status}
                      </span>
                      <span className="text-[11px] text-slate-400">{ver.createdAt}</span>
                    </div>
                    <p className="font-bold text-[#15191C] mt-1">{ver.changeSummary}</p>
                    <p className="text-[11px] text-slate-500">
                      Author: {ver.authorName} ({ver.authorRole})
                      {ver.publishedBy ? ` • Published by ${ver.publishedBy}` : ''}
                    </p>
                  </div>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRollbackVersion(ver.versionId)}
                      className="rounded-xl bg-[#0B1528] hover:bg-[#FF6500] text-white font-extrabold px-3 py-2 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore & Rollback
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Owner Publishing & Self-Approval Governance Controls */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF6500]" />
              <h3 className="text-base font-extrabold text-[#15191C]">
                Owner Publishing & Governance Rules
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Only the Owner can configure who is permitted to edit, approve, and publish website changes.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#F4F6F9] border border-slate-200">
                <span className="font-bold text-slate-700 block">Roles Allowed to Edit & Submit Drafts:</span>
                <span className="text-[11px] text-[#FF6500] font-extrabold">
                  {pubPerms.rolesAllowedToEdit.join(' • ')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F6F9] border border-slate-200">
                <span className="font-bold text-slate-700 block">Roles Allowed to Approve & Publish Live:</span>
                <span className="text-[11px] text-emerald-700 font-extrabold">
                  {pubPerms.rolesAllowedToPublish.join(' • ')}
                </span>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
                <div>
                  <span className="font-extrabold text-amber-950 block">
                    Allow Employee Self-Approval Exception (Audited)
                  </span>
                  <span className="text-[11px] text-amber-800">
                    When disabled (default), employees cannot approve their own submissions.
                  </span>
                </div>
                <input
                  type="checkbox"
                  disabled={!isOwner}
                  checked={pubPerms.allowSelfApprovalException}
                  onChange={(e) => {
                    const next = {
                      ...pubPerms,
                      allowSelfApprovalException: e.target.checked
                    };
                    setPubPerms(next);
                    WebsiteCmsAndWorkforceService.savePublishingPermissions(next);
                    onNotice(
                      `Self-approval exception ${e.target.checked ? 'ENABLED (Audited)' : 'DISABLED'}.`
                    );
                  }}
                  className="w-4 h-4 accent-[#FF6500]"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
