import React, { useState } from 'react';
import {
  FileText,
  Presentation,
  ClipboardCheck,
  Plus,
  Save,
  Download,
  Trash2,
  CheckCircle2,
  Printer
} from 'lucide-react';
import {
  OfficeSuiteDocument,
  WebsiteCmsAndWorkforceService
} from '../../services/websiteCmsService';

interface OfficeSuiteWorkspaceProps {
  departmentName: string;
  actorName: string;
  onNotice?: (msg: string) => void;
}

export const OfficeSuiteWorkspace: React.FC<OfficeSuiteWorkspaceProps> = ({
  departmentName,
  actorName,
  onNotice
}) => {
  const [docs, setDocs] = useState<OfficeSuiteDocument[]>(() =>
    WebsiteCmsAndWorkforceService.getOfficeDocuments()
  );
  const [selectedDocId, setSelectedDocId] = useState<string>(docs[0]?.id || '');
  const [newDocType, setNewDocType] = useState<'Document' | 'Presentation' | 'Form'>('Document');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newSlideHeading, setNewSlideHeading] = useState('');
  const [newSlideBody, setNewSlideBody] = useState('');
  const [formResponses, setFormResponses] = useState<Record<string, string>>({});

  const activeDoc = docs.find((d) => d.id === selectedDocId) || docs[0];

  const handleSaveActiveDoc = (updatedDoc: OfficeSuiteDocument) => {
    const next = docs.map((d) =>
      d.id === updatedDoc.id
        ? {
            ...updatedDoc,
            updatedBy: actorName,
            updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
          }
        : d
    );
    setDocs(next);
    WebsiteCmsAndWorkforceService.saveOfficeDocuments(next);
  };

  const handleCreateNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    const created: OfficeSuiteDocument = {
      id: `DOC-${Math.floor(110 + Math.random() * 890)}`,
      department: departmentName,
      docType: newDocType,
      title: newDocTitle.trim(),
      contentBody:
        newDocType === 'Document'
          ? `OFFICIAL MRIDE ZAMBIA — ${departmentName.toUpperCase()} DOCUMENT\n\nPrepared by: ${actorName}\n\n1. Executive Summary:\nEnter operational details here...`
          : `Overview for ${newDocTitle.trim()}`,
      slidesOrFields:
        newDocType === 'Presentation'
          ? [
              {
                heading: 'Slide 1: Executive Overview & Objectives',
                body: `Prepared by ${actorName} for ${departmentName}.`
              }
            ]
          : newDocType === 'Form'
          ? [
              {
                heading: 'Verification Field 1: Full Name / Reference ID',
                body: 'Required text entry'
              }
            ]
          : [],
      updatedBy: actorName,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    const next = [created, ...docs];
    setDocs(next);
    WebsiteCmsAndWorkforceService.saveOfficeDocuments(next);
    setSelectedDocId(created.id);
    setNewDocTitle('');
    onNotice?.(`Created new ${created.docType}: "${created.title}".`);
  };

  const handleExportDocument = (doc: OfficeSuiteDocument) => {
    const slidesText = doc.slidesOrFields
      .map((s, idx) => `\n[${idx + 1}] ${s.heading}\n${s.body}`)
      .join('\n');
    const fullText = `====================================================\nMRIDE ZAMBIA — ${doc.docType.toUpperCase()}\nTitle: ${doc.title}\nDepartment: ${doc.department}\nLast Updated: ${doc.updatedAt} by ${doc.updatedBy}\n====================================================\n\n${doc.contentBody}\n${slidesText}\n`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotice?.(`Exported "${doc.title}" to file.`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden text-xs">
      {/* Top Office Suite Header */}
      <div className="bg-[#0B1528] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500] block">
            Mride Functional Office Suite • {departmentName}
          </span>
          <h3 className="text-sm font-extrabold">
            Documents, Slide Presentations, Departmental Forms & Cloud File Storage
          </h3>
        </div>

        {/* Create New Office File Bar */}
        <form onSubmit={handleCreateNewDoc} className="flex flex-wrap items-center gap-2">
          <select
            value={newDocType}
            onChange={(e) => setNewDocType(e.target.value as 'Document' | 'Presentation' | 'Form')}
            className="rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-white font-bold text-[11px]"
          >
            <option value="Document" className="text-slate-900">Word / SOP Document</option>
            <option value="Presentation" className="text-slate-900">Slide Presentation</option>
            <option value="Form" className="text-slate-900">Inspection / Operational Form</option>
          </select>
          <input
            type="text"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            placeholder="New file title..."
            className="rounded-lg bg-white text-[#15191C] px-3 py-1.5 font-bold text-[11px] w-48"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#FF6500] hover:bg-[#e55a00] text-white font-extrabold px-3 py-1.5 text-[11px] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Create File
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
        {/* Left File Storage Sidebar */}
        <div className="lg:col-span-4 border-r border-slate-200 bg-[#F8FAFC] p-3.5 space-y-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
            Saved Office Files ({docs.length})
          </p>
          {docs.map((doc) => {
            const isSelected = activeDoc?.id === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'border-[#FF6500] bg-[#FFF0E6]/60 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-lg bg-[#0B1528] text-white shrink-0">
                  {doc.docType === 'Document' ? (
                    <FileText className="w-4 h-4 text-sky-400" />
                  ) : doc.docType === 'Presentation' ? (
                    <Presentation className="w-4 h-4 text-[#FF6500]" />
                  ) : (
                    <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase text-[#FF6500] block">
                    {doc.docType} • {doc.department}
                  </span>
                  <strong className="text-[#15191C] block truncate">{doc.title}</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Updated {doc.updatedAt} by {doc.updatedBy}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Live Editor Canvas */}
        <div className="lg:col-span-8 p-5 space-y-4">
          {activeDoc ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex-1 min-w-[220px]">
                  <input
                    type="text"
                    value={activeDoc.title}
                    onChange={(e) =>
                      handleSaveActiveDoc({ ...activeDoc, title: e.target.value })
                    }
                    className="w-full text-base font-extrabold text-[#15191C] bg-transparent border-b border-transparent focus:border-[#FF6500] outline-none"
                  />
                  <span className="text-[11px] text-slate-500">
                    {activeDoc.docType} ID: <strong>{activeDoc.id}</strong> • Last saved by{' '}
                    {activeDoc.updatedBy} ({activeDoc.updatedAt})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveActiveDoc(activeDoc);
                      onNotice?.(`Saved "${activeDoc.title}" to Mride Office Cloud.`);
                    }}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportDocument(activeDoc)}
                    className="rounded-lg bg-[#0B1528] text-white font-bold px-3 py-1.5 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5"
                    title="Print"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Body Editor */}
              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  {activeDoc.docType === 'Document'
                    ? 'Full Document Content (Editable SOP / Memo / Policy)'
                    : 'Executive Summary & Instructions'}
                </label>
                <textarea
                  rows={activeDoc.docType === 'Document' ? 10 : 3}
                  value={activeDoc.contentBody}
                  onChange={(e) =>
                    handleSaveActiveDoc({ ...activeDoc, contentBody: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 font-mono text-xs leading-relaxed text-[#15191C] focus:bg-white focus:border-[#FF6500] outline-none"
                />
              </div>

              {/* Presentation Slides OR Form Fields Builder */}
              {(activeDoc.docType === 'Presentation' || activeDoc.docType === 'Form') && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <h4 className="font-extrabold text-[#15191C]">
                    {activeDoc.docType === 'Presentation'
                      ? `Presentation Slides (${activeDoc.slidesOrFields.length})`
                      : `Interactive Form Fields (${activeDoc.slidesOrFields.length})`}
                  </h4>

                  <div className="space-y-2.5">
                    {activeDoc.slidesOrFields.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#F4F6F9] border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-[#15191C]">{item.heading}</strong>
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = activeDoc.slidesOrFields.filter(
                                (_, i) => i !== idx
                              );
                              handleSaveActiveDoc({ ...activeDoc, slidesOrFields: filtered });
                            }}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-slate-600">{item.body}</p>

                        {activeDoc.docType === 'Form' && (
                          <input
                            type="text"
                            value={formResponses[`${activeDoc.id}_${idx}`] || ''}
                            onChange={(e) =>
                              setFormResponses({
                                ...formResponses,
                                [`${activeDoc.id}_${idx}`]: e.target.value
                              })
                            }
                            placeholder="Enter official staff response / verification note..."
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Slide or Field */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    <input
                      type="text"
                      value={newSlideHeading}
                      onChange={(e) => setNewSlideHeading(e.target.value)}
                      placeholder={
                        activeDoc.docType === 'Presentation'
                          ? 'Slide Title...'
                          : 'Form Question / Field Label...'
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2 font-bold"
                    />
                    <input
                      type="text"
                      value={newSlideBody}
                      onChange={(e) => setNewSlideBody(e.target.value)}
                      placeholder={
                        activeDoc.docType === 'Presentation'
                          ? 'Slide bullet points / content...'
                          : 'Field validation rule or instructions...'
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSlideHeading.trim()) return;
                        handleSaveActiveDoc({
                          ...activeDoc,
                          slidesOrFields: [
                            ...activeDoc.slidesOrFields,
                            {
                              heading: newSlideHeading.trim(),
                              body: newSlideBody.trim() || 'Recorded item'
                            }
                          ]
                        });
                        setNewSlideHeading('');
                        setNewSlideBody('');
                      }}
                      className="rounded-xl bg-[#0B1528] text-white font-extrabold px-3 py-2"
                    >
                      + Add {activeDoc.docType === 'Presentation' ? 'Slide' : 'Form Field'}
                    </button>
                  </div>

                  {activeDoc.docType === 'Form' && (
                    <button
                      type="button"
                      onClick={() =>
                        onNotice?.(
                          `Submitted completed form "${activeDoc.title}" signed by ${actorName}!`
                        )
                      }
                      className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Submit Completed Departmental Form
                    </button>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
