import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ExternalLink, Star, StarOff, Edit2, X, Save, Rocket, GitBranch, Zap, Loader2, Plus, Trash2, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { Product } from '../types';
import { Breadcrumbs } from './Breadcrumbs';

export const CentralElevateView: React.FC = () => {
  const { products, user, originalUserRole, createProduct, updateProduct, deleteProduct, loadAllData } = useStore();
  
  // Recargar productos cuando se monta el componente para obtener el estado de Vercel actualizado
  useEffect(() => {
    if (user) {
      console.log('🔄 CentralElevateView montado, recargando productos...');
      loadAllData();
    }
  }, [user]);

  // Debug: Log productos cuando cambian
  useEffect(() => {
    console.log('📋 Productos en CentralElevateView:', products.map(p => ({
      name: p.name,
      vercelProjectId: p.vercelProjectId,
      vercelTeamId: p.vercelTeamId,
      vercelDeploymentStatus: p.vercelDeploymentStatus,
      vercelLastDeployment: p.vercelLastDeployment
    })));
  }, [products]);
  const [filter, setFilter] = useState<'all' | 'starred'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Check if user can edit (only CTO)
  const canEdit = originalUserRole === 'CTO';

  // Filter products
  const filteredProducts = products.filter(p => {
    if (filter === 'starred') return p.isStarred === true;
    return true;
  });

  const handleToggleStar = async (product: Product) => {
    if (!user || !canEdit) return;
    
    setLoading(product.id);
    try {
      await updateProduct(product.id, { isStarred: !product.isStarred });
    } catch (error) {
      console.error('Error toggling star:', error);
      alert('Error al actualizar el producto');
    } finally {
      setLoading(null);
    }
  };

  const handleOpenUrl = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };


  const handleEditProduct = (product: Product) => {
    if (!canEdit) return;
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!canEdit) return;
    if (!window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) return;

    setLoading(product.id);
    try {
      await deleteProduct(product.id);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    } finally {
      setLoading(null);
    }
  };

  const getVercelStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'READY': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ERROR': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'BUILDING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'QUEUED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'CANCELED': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getVercelStatusLabel = (status: string | null | undefined) => {
    switch (status) {
      case 'READY': return 'Listo';
      case 'ERROR': return 'Error';
      case 'BUILDING': return 'Construyendo';
      case 'QUEUED': return 'En Cola';
      case 'CANCELED': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <Breadcrumbs 
        items={[
          { label: 'Panel Principal', onClick: () => {} },
          { label: 'Central Elevate' }
        ]}
      />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-h2 text-white mb-2 flex items-center gap-2">
            <Rocket className="text-yellow-400" size={28} />
            Central Elevate
          </h2>
          <p className="text-body text-slate-400">
            Productos en línea y plataformas con suscripciones
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-violet-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} />
            Agregar Producto
          </button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
              : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800/50 border border-white/10'
          }`}
        >
          Todos los Productos
        </button>
        <button
          onClick={() => setFilter('starred')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            filter === 'starred'
              ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/20'
              : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800/50 border border-white/10'
          }`}
        >
          <Star size={16} className={filter === 'starred' ? 'fill-current' : ''} />
          Productos Estrella
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          // Debug log para ver qué datos tiene el producto al renderizar
          if (product.vercelProjectId || product.vercelDeploymentStatus) {
            console.log(`🎨 Renderizando producto ${product.name}:`, {
              vercelProjectId: product.vercelProjectId,
              vercelTeamId: product.vercelTeamId,
              vercelDeploymentStatus: product.vercelDeploymentStatus,
              vercelLastDeployment: product.vercelLastDeployment,
              tieneBadge: !!product.vercelProjectId,
              tieneStatus: !!product.vercelDeploymentStatus
            });
          }
          return (
            <div
              key={product.id}
              className={`glass-card rounded-2xl border transition-all hover:border-violet-500/50 group min-h-[400px] flex flex-col ${
                product.isStarred ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent' : 'border-white/10'
              }`}
            >
              <div className="p-6 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Product Image */}
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Rocket className="text-violet-400" size={28} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-xl group-hover:text-violet-400 transition-colors truncate mb-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.currentStatus && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {product.currentStatus}
                          </span>
                        )}
                        {product.vercelProjectId ? (
                          product.vercelDeploymentStatus ? (
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getVercelStatusColor(product.vercelDeploymentStatus)}`}>
                              <Zap size={12} className="inline mr-1" />
                              {getVercelStatusLabel(product.vercelDeploymentStatus)}
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
                              <AlertCircle size={12} className="inline mr-1" />
                              Cargando...
                            </span>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {canEdit && (
                      <>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                          title="Editar producto"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          disabled={loading === product.id}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Eliminar producto"
                        >
                          {loading === product.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleToggleStar(product)}
                        disabled={loading === product.id}
                        className={`p-2 rounded-lg transition-all ${
                          product.isStarred
                            ? 'text-yellow-400 hover:bg-yellow-500/10'
                            : 'text-slate-500 hover:text-yellow-400 hover:bg-yellow-500/5'
                        }`}
                        title={product.isStarred ? 'Quitar de destacados' : 'Marcar como destacado'}
                      >
                        {loading === product.id ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : product.isStarred ? (
                          <Star size={20} className="fill-current" />
                        ) : (
                          <StarOff size={20} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Description - Always visible, more space */}
                <div className="mb-4 flex-1">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {product.description || <span className="text-slate-500 italic">Sin descripción</span>}
                  </p>
                </div>

                {/* Features - Always visible if exist */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-500 mb-2">Características:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.features.slice(0, 4).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-800/50 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/50"
                        >
                          {feature}
                        </span>
                      ))}
                      {product.features.length > 4 && (
                        <span className="text-xs text-slate-500 px-2.5 py-1">
                          +{product.features.length - 4} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Vercel Deployment Info - Always visible if available */}
                {product.vercelDeploymentStatus && (
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        {product.vercelLastDeployment ? (
                          <>
                            <p className="text-xs font-medium text-slate-400 mb-1">Último Deployment:</p>
                            <p className="text-sm text-slate-300">
                              {new Date(product.vercelLastDeployment).toLocaleString('es-ES', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400">Estado: {getVercelStatusLabel(product.vercelDeploymentStatus)}</p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded ${getVercelStatusColor(product.vercelDeploymentStatus)}`}>
                        <Zap size={14} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Git, Vercel, Product */}
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  {product.gitRepoUrl ? (
                    <button
                      onClick={() => handleOpenUrl(product.gitRepoUrl!)}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all border border-white/10"
                    >
                      <GitBranch size={16} />
                      Git
                    </button>
                  ) : (
                    <div className="bg-slate-900/50 text-slate-600 px-3 py-2.5 rounded-lg text-sm flex items-center justify-center border border-white/5">
                      <GitBranch size={16} />
                    </div>
                  )}
                  {product.vercelUrl ? (
                    <button
                      onClick={() => handleOpenUrl(product.vercelUrl!)}
                      className="bg-black hover:bg-slate-900 text-white px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all border border-white/10"
                    >
                      <Zap size={16} />
                      Vercel
                    </button>
                  ) : (
                    <div className="bg-slate-900/50 text-slate-600 px-3 py-2.5 rounded-lg text-sm flex items-center justify-center border border-white/5">
                      <Zap size={16} />
                    </div>
                  )}
                  {product.productUrl ? (
                    <button
                      onClick={() => handleOpenUrl(product.productUrl!)}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20"
                    >
                      <ExternalLink size={16} />
                      Producto
                    </button>
                  ) : (
                    <div className="bg-slate-900/50 text-slate-600 px-3 py-2.5 rounded-lg text-sm flex items-center justify-center border border-white/5">
                      <ExternalLink size={16} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Rocket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">
            {filter === 'starred' ? 'No hay productos estrella todavía' : 'No hay productos en línea'}
          </p>
          <p className="text-slate-500 text-sm">
            {canEdit 
              ? 'Agrega tu primer producto para comenzar' 
              : 'Los productos aparecerán aquí cuando el CTO los agregue'}
          </p>
        </div>
      )}

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <ProductModal
          onClose={() => setIsCreateModalOpen(false)}
          onSave={async (data) => {
            try {
              await createProduct(data);
              setIsCreateModalOpen(false);
            } catch (error) {
              alert('Error al crear el producto');
            }
          }}
          loading={false}
        />
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={async (data) => {
            try {
              await updateProduct(editingProduct.id, data);
              setIsEditModalOpen(false);
              setEditingProduct(null);
            } catch (error) {
              alert('Error al actualizar el producto');
            }
          }}
          loading={loading === editingProduct.id}
        />
      )}
    </div>
  );
};

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
  loading: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave, loading }) => {
  const { uploadProductImage } = useStore();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    imageUrl: product?.imageUrl || '',
    currentStatus: product?.currentStatus || '',
    features: product?.features || [],
    gitRepoUrl: product?.gitRepoUrl || '',
    vercelUrl: product?.vercelUrl || '',
    vercelProjectId: product?.vercelProjectId || '',
    vercelTeamId: product?.vercelTeamId || '',
    productUrl: product?.productUrl || '',
  });
  const [newFeature, setNewFeature] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const imageUrl = await uploadProductImage(file, product?.id);
      setFormData({ ...formData, imageUrl });
      setImagePreview(imageUrl);
    } catch (error: any) {
      setError(error.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.name.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }

    try {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Error al guardar el producto');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-white/10 p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {product ? `Editar Producto: ${product.name}` : 'Agregar Nuevo Producto'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle size={16} />
              <span>Producto guardado exitosamente</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="Ej: Nexus AI Platform"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <ImageIcon size={14} className="inline mr-1" />
              Imagen del Producto
            </label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-lg object-cover border border-slate-200 dark:border-white/10"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    title="Eliminar imagen"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                  <ImageIcon className="text-slate-400" size={32} />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                  id="product-image-upload"
                />
                <label
                  htmlFor="product-image-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    uploadingImage
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : 'bg-violet-600 hover:bg-violet-700 text-white'
                  }`}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <ImageIcon size={16} />
                      {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                    </>
                  )}
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Formatos: JPG, PNG, GIF. Máximo 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              placeholder="Describe el producto..."
            />
          </div>

          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Estado Actual
            </label>
            <input
              type="text"
              value={formData.currentStatus}
              onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="Ej: Activo, Mantenimiento, Beta, etc."
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <GitBranch size={14} className="inline mr-1" />
                Repositorio Git
              </label>
              <input
                type="url"
                value={formData.gitRepoUrl}
                onChange={(e) => setFormData({ ...formData, gitRepoUrl: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="https://github.com/usuario/repo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Zap size={14} className="inline mr-1" />
                URL de Vercel
              </label>
              <input
                type="url"
                value={formData.vercelUrl}
                onChange={(e) => setFormData({ ...formData, vercelUrl: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="https://proyecto.vercel.app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Zap size={14} className="inline mr-1" />
                Vercel Project ID (para integración API)
              </label>
              <input
                type="text"
                value={formData.vercelProjectId}
                onChange={(e) => setFormData({ ...formData, vercelProjectId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="prj_xxxxxxxxxxxxx"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Opcional: ID del proyecto en Vercel para obtener el estado del deployment automáticamente
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Zap size={14} className="inline mr-1" />
                Vercel Team ID (si el proyecto está en un equipo)
              </label>
              <input
                type="text"
                value={formData.vercelTeamId}
                onChange={(e) => setFormData({ ...formData, vercelTeamId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="team_xxxxxxxxxxxxx o nombre-del-equipo"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="text-amber-500 dark:text-amber-400">⚠️ Requerido si el proyecto está en un equipo.</span> Encuéntralo en Settings del Equipo &gt; General en Vercel
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <ExternalLink size={14} className="inline mr-1" />
                Enlace del Producto
              </label>
              <input
                type="url"
                value={formData.productUrl}
                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="https://producto.com"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Características del Producto
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Agregar característica..."
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-lg text-sm"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-violet-500 hover:text-violet-700 dark:hover:text-violet-200"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {product ? 'Guardar Cambios' : 'Crear Producto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
