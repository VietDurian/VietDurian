"use client";
import Navbar from "@/components/Navbar";
import {
    X, ImageIcon, BookOpen, Plus, ChevronRight, CheckCircle,
    Trash2, Edit2, ArrowLeft, Loader2,
} from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { blogAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

// ==================== CONFIRM MODAL ====================
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <p className="text-gray-800 text-sm mb-6 text-center">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm">{t('create_blog_confirm_cancel')}</button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition text-sm">{t('create_blog_confirm_delete')}</button>
                </div>
            </div>
        </div>
    );
};

// ==================== MODAL COMPONENT ====================
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white text-black w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
                <div className="relative flex items-center justify-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-center flex-1">{title}</h2>
                    <button onClick={onClose} className="absolute right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition" aria-label="Đóng">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>
                <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

// ==================== STEP INDICATOR ====================
const StepIndicator = ({ currentStep }) => {
    const { t } = useLanguage();
    const steps = [
        { number: 1, title: t('create_blog_step1_title') },
        { number: 2, title: t('create_blog_step2_title') },
    ];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= step.number ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                            {currentStep > step.number ? <CheckCircle size={20} /> : step.number}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${currentStep >= step.number ? "text-emerald-500" : "text-gray-500"}`}>{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-24 h-1 mx-4 transition-all ${currentStep > step.number ? "bg-emerald-500" : "bg-gray-200"}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

// ==================== IMAGE UPLOAD COMPONENT ====================
const ImageUpload = ({ image, onImageChange, onImageRemove, label }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef(null);
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            {!image ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={40} />
                    <p className="text-sm font-medium text-gray-600">{t('create_blog_image_click')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('create_blog_image_hint')}</p>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={image} alt="Preview" className="w-full h-64 object-cover bg-gray-50" />
                    <button type="button" onClick={onImageRemove} className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all"><X size={18} /></button>
                </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
        </div>
    );
};

// ==================== KNOWLEDGE BLOCK CARD ====================
const KnowledgeBlockCard = ({ block, index, onEdit, onDelete }) => {
    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-emerald-400 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{index + 1}</div>
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-1">{block.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onEdit(index)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Sửa"><Edit2 size={18} /></button>
                    <button type="button" onClick={() => onDelete(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa"><Trash2 size={18} /></button>
                </div>
            </div>
            {block.image && (
                <div className="mb-3 rounded-lg overflow-hidden">
                    <img src={block.image} alt={block.title} className="w-full h-40 object-cover" />
                </div>
            )}
            <p className="text-gray-600 text-sm line-clamp-3 whitespace-pre-wrap">{block.content}</p>
        </div>
    );
};

// ==================== MAIN PAGE ====================
export default function CreateBlogPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: "", onConfirm: null });
    const openConfirm = (message, onConfirm) => setConfirmModal({ isOpen: true, message, onConfirm });
    const closeConfirm = () => setConfirmModal({ isOpen: false, message: "", onConfirm: null });

    const [blogTitle, setBlogTitle] = useState("");
    const [blogContent, setBlogContent] = useState("");
    const [blogImage, setBlogImage] = useState("");
    const [blogImageData, setBlogImageData] = useState("");

    const [knowledgeBlocks, setKnowledgeBlocks] = useState([]);
    const [isAddingBlock, setIsAddingBlock] = useState(false);
    const [editingBlockIndex, setEditingBlockIndex] = useState(null);

    const [blockTitle, setBlockTitle] = useState("");
    const [blockContent, setBlockContent] = useState("");
    const [blockImage, setBlockImage] = useState("");
    const [blockImageData, setBlockImageData] = useState("");

    const handleBlogImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError(t('create_blog_image_too_large')); return; }
        const reader = new FileReader();
        reader.onload = () => { const result = reader.result?.toString() || ""; setBlogImageData(result); setBlogImage(result); };
        reader.readAsDataURL(file);
    };

    const handleBlockImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError(t('create_blog_image_too_large')); return; }
        const reader = new FileReader();
        reader.onload = () => { const result = reader.result?.toString() || ""; setBlockImageData(result); setBlockImage(result); };
        reader.readAsDataURL(file);
    };

    const canProceedToStep2 = () => blogTitle.trim() !== "" && blogContent.trim() !== "" && blogImageData !== "";

    const handleProceedToStep2 = () => {
        if (!canProceedToStep2()) { setError(t('create_blog_step1_required')); return; }
        setError("");
        setCurrentStep(2);
    };

    const handleSaveBlock = () => {
        if (!blockTitle.trim() || !blockContent.trim() || !blockImageData) {
            setError(t('create_blog_block_required'));
            return;
        }
        const newBlock = { title: blockTitle.trim(), content: blockContent.trim(), image: blockImageData };
        if (editingBlockIndex !== null) {
            const updated = [...knowledgeBlocks];
            updated[editingBlockIndex] = newBlock;
            setKnowledgeBlocks(updated);
            setEditingBlockIndex(null);
        } else {
            setKnowledgeBlocks([...knowledgeBlocks, newBlock]);
        }
        setBlockTitle(""); setBlockContent(""); setBlockImage(""); setBlockImageData("");
        setIsAddingBlock(false); setError("");
    };

    const handleEditBlock = (index) => {
        const block = knowledgeBlocks[index];
        if (!block) return;
        setBlockTitle(block.title); setBlockContent(block.content);
        setBlockImage(block.image); setBlockImageData(block.image);
        setEditingBlockIndex(index); setIsAddingBlock(true);
    };

    const handleDeleteBlock = (index) => {
        openConfirm(t('create_blog_delete_block_confirm'), () => {
            setKnowledgeBlocks(knowledgeBlocks.filter((_, i) => i !== index));
            closeConfirm();
        });
    };

    const handleCancelBlock = () => {
        setBlockTitle(""); setBlockContent(""); setBlockImage(""); setBlockImageData("");
        setIsAddingBlock(false); setEditingBlockIndex(null); setError("");
    };

    const handleSubmitBlog = async () => {
        if (knowledgeBlocks.length === 0) { setError(t('create_blog_chapter_required')); return; }
        setIsSubmitting(true); setError("");
        try {
            const blogData = {
                title: blogTitle,
                content: blogContent,
                image: blogImageData,
                knowledgeBlocks: knowledgeBlocks.map((block) => ({
                    title: block.title,
                    content: block.content,
                    image: block.image,
                })),
            };
            const result = await blogAPI.createBlog(blogData);
            if (result.code !== 201) throw new Error(t('create_blog_create_fail'));
            router.push("/profile/blogs");
        } catch (err) {
            console.error("Error creating blog:", err);
            setError(err.message || t('create_blog_fail'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <section className="pt-10 pb-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-emerald-500 rounded-3xl shadow-xl p-8">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8 font-medium cursor-pointer">
                            <ArrowLeft size={20} /><span>{t('create_blog_back')}</span>
                        </button>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('create_blog_title')}</h1>
                            <p className="text-emerald-50 text-lg">{t('create_blog_subtitle')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <StepIndicator currentStep={currentStep} />

                    {error && (
                        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                            <X className="text-red-600 flex-shrink-0" size={20} />
                            <p className="text-red-700 font-medium">{error}</p>
                            <button onClick={() => setError("")} className="ml-auto text-red-600 hover:text-red-800"><X size={18} /></button>
                        </div>
                    )}

                    {/* ── STEP 1 ── */}
                    {currentStep === 1 && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <BookOpen className="text-emerald-500" size={28} />{t('create_blog_info_title')}
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('create_blog_title_label')} <span className="text-red-500">*</span></label>
                                    <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder={t('create_blog_title_placeholder')} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" maxLength={200} />
                                    <div className="text-xs text-gray-500 text-right mt-1">{blogTitle.length}/200</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('create_blog_intro_label')} <span className="text-red-500">*</span></label>
                                    <textarea value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder={t('create_blog_intro_placeholder')} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" rows={6} maxLength={1000} />
                                    <div className="text-xs text-gray-500 text-right mt-1">{blogContent.length}/1000</div>
                                </div>
                                <ImageUpload image={blogImage} onImageChange={handleBlogImageChange} onImageRemove={() => { setBlogImage(""); setBlogImageData(""); }} label={<>Ảnh đại diện <span className="text-red-500">*</span></>} />
                                <div className="flex justify-end pt-4">
                                    <button onClick={handleProceedToStep2} disabled={!canProceedToStep2()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                        {t('create_blog_next_btn')}<ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2 ── */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle className="text-emerald-500" size={24} />
                                    <h3 className="text-lg font-bold text-gray-900">{t('create_blog_info_title')}</h3>
                                    <button onClick={() => setCurrentStep(1)} className="ml-auto text-emerald-500 hover:text-emerald-600 text-sm font-medium">{t('create_blog_step_edit')}</button>
                                </div>
                                <div className="flex gap-4">
                                    {blogImage && <img src={blogImage} alt={blogTitle} className="w-32 h-32 object-cover rounded-lg flex-shrink-0" />}
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-xl mb-2">{blogTitle}</h4>
                                        <p className="text-gray-600 text-sm line-clamp-3">{blogContent}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <BookOpen className="text-emerald-500" size={28} />{t('create_blog_chapters_title')} ({knowledgeBlocks.length})
                                    </h2>
                                    {!isAddingBlock && (
                                        <button onClick={() => setIsAddingBlock(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2">
                                            <Plus size={20} />{t('create_blog_add_chapter_btn')}
                                        </button>
                                    )}
                                </div>

                                {knowledgeBlocks.length > 0 && (
                                    <div className="grid grid-cols-1 gap-4 mb-6">
                                        {knowledgeBlocks.map((block, index) => (
                                            <KnowledgeBlockCard key={index} block={block} index={index} onEdit={handleEditBlock} onDelete={handleDeleteBlock} />
                                        ))}
                                    </div>
                                )}

                                {knowledgeBlocks.length === 0 && !isAddingBlock && (
                                    <div className="text-center py-12">
                                        <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
                                        <p className="text-gray-500 text-lg mb-4">{t('create_blog_no_chapters')}</p>
                                        <button onClick={() => setIsAddingBlock(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all inline-flex items-center gap-2">
                                            <Plus size={20} />{t('create_blog_add_first_chapter')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <Modal isOpen={isAddingBlock} onClose={handleCancelBlock} title={editingBlockIndex !== null ? t('create_blog_block_modal_edit') : t('create_blog_block_modal_add')}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('create_blog_block_title_label')} <span className="text-red-500">*</span></label>
                                        <input type="text" value={blockTitle} onChange={(e) => setBlockTitle(e.target.value)} placeholder={t('create_blog_block_title_placeholder')} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" maxLength={200} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('create_blog_block_content_label')} <span className="text-red-500">*</span></label>
                                        <textarea value={blockContent} onChange={(e) => setBlockContent(e.target.value)} placeholder={t('create_blog_block_content_placeholder')} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-white" rows={6} maxLength={5000} />
                                        <div className="text-xs text-gray-500 text-right mt-1">{blockContent.length}/5000</div>
                                    </div>
                                    <ImageUpload image={blockImage} onImageChange={handleBlockImageChange} onImageRemove={() => { setBlockImage(""); setBlockImageData(""); }} label={<>{t('create_blog_block_image_label')} <span className="text-red-500">*</span></>} />
                                    <div className="pt-4">
                                        <button
                                            type="button"
                                            onClick={handleSaveBlock}
                                            disabled={!blockTitle.trim() || !blockContent.trim() || !blockImageData}
                                            className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                            {editingBlockIndex !== null ? t('create_blog_block_update_btn') : t('create_blog_block_add_btn')}
                                        </button>
                                    </div>
                                </div>
                            </Modal>

                            <div className="flex justify-between items-center">
                                <button onClick={() => setCurrentStep(1)} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">{t('create_blog_back_btn')}</button>
                                <button onClick={handleSubmitBlog} disabled={knowledgeBlocks.length === 0 || isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {isSubmitting
                                        ? (<><Loader2 className="w-5 h-5 animate-spin" />{t('create_blog_saving')}</>)
                                        : (<><CheckCircle size={20} />{t('create_blog_submit_btn')}</>)}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmModal.onConfirm}
                message={confirmModal.message}
            />
        </div>
    );
}