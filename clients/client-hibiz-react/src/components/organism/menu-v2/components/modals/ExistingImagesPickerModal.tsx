import PopUp from '@/components/atom/popUp';
import { Check, Images, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';
import { db } from '../../db/menu.database';
import { useMenuUIStore } from '../../store/useMenuUIStore';
import '../../styles/brutalist.css';
import type { MenuDish } from '../../types';

interface ExistingImage {
  url: string;
  dishes: Array<{
    dishId: string;
    dishName: string;
  }>;
}

interface ExistingImagesPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  onSelect: (urls: string[]) => void;
}

export const ExistingImagesPickerModal = ({ isOpen, onClose, businessId, onSelect }: ExistingImagesPickerModalProps) => {
  const selectedMenuId = useMenuUIStore((s) => s.selectedMenuId);
  const [searchQuery, setSearchQuery] = useState('');
  const [allImages, setAllImages] = useState<ExistingImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUrls(new Set());
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !businessId) return;

    const loadImages = async () => {
      setLoading(true);
      try {
        const allDishes = (await db.dishes.where('businessId').equals(businessId).toArray()) as MenuDish[];

        const filteredDishes = selectedMenuId === 'ALL' ? allDishes : allDishes.filter((d) => d.menuId === selectedMenuId);

        const imageMap = new Map<string, Array<{ dishId: string; dishName: string }>>();

        for (const dish of filteredDishes) {
          const images = Array.isArray(dish.images) ? dish.images : [];
          for (const url of images) {
            if (!url || typeof url !== 'string') continue;
            if (!imageMap.has(url)) {
              imageMap.set(url, []);
            }
            imageMap.get(url)!.push({
              dishId: dish._id,
              dishName: dish.name || 'Unknown',
            });
          }
        }

        const imagesArray: ExistingImage[] = Array.from(imageMap.entries()).map(([url, dishes]) => ({
          url,
          dishes,
        }));

        setAllImages(imagesArray);
      } catch (error) {
        console.error('Error loading existing images:', error);
        toast.error('Failed to load existing images');
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [isOpen, businessId, selectedMenuId]);

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return allImages;

    const query = searchQuery.toLowerCase();
    return allImages.filter((img) => {
      const urlMatch = img.url.toLowerCase().includes(query);
      const dishMatch = img.dishes.some((d) => d.dishName.toLowerCase().includes(query));
      const filenameMatch = img.url.split('/').pop()?.toLowerCase().includes(query);

      return urlMatch || dishMatch || filenameMatch;
    });
  }, [allImages, searchQuery]);

  const handleToggleSelect = useCallback((url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedUrls((prev) => {
      const filteredUrls = new Set(filteredImages.map((img) => img.url));
      const allSelected = filteredImages.every((img) => prev.has(img.url));

      if (allSelected) {
        // Deselect all filtered images
        const next = new Set(prev);
        for (const url of filteredUrls) {
          next.delete(url);
        }
        return next;
      }
      // Select all filtered images
      return new Set([...prev, ...filteredUrls]);
    });
  }, [filteredImages]);

  const handleConfirm = useCallback(() => {
    if (selectedUrls.size > 0) {
      onSelect(Array.from(selectedUrls));
      setSelectedUrls(new Set());
      setSearchQuery('');
      onClose();
    }
  }, [selectedUrls, onSelect, onClose]);

  const handleCancel = useCallback(() => {
    setSelectedUrls(new Set());
    setSearchQuery('');
    onClose();
  }, [onClose]);

  const filteredSelectedCount = filteredImages.filter((img) => selectedUrls.has(img.url)).length;
  const allFilteredSelected = filteredImages.length > 0 && filteredSelectedCount === filteredImages.length;

  if (!isOpen) return null;

  return (
    <PopUp show={isOpen} onClose={handleCancel} hide>
      <section
        className="hide-scrollbar max-h-[100dvh] min-h-[100dvh] overflow-y-auto pb-[100px] lg:max-h-[90dvh] lg:min-h-[70dvh]"
        style={{ background: '#F3F4F6' }}
      >
        <button
          className="brutal-button absolute right-4 top-6 z-50"
          type="button"
          onClick={handleCancel}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HiX style={{ width: '20px', height: '20px' }} />
        </button>

        <div className="brutal-card" style={{ margin: '24px', padding: '24px', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="brutal-heading" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Images style={{ width: '24px', height: '24px' }} />
              USE EXISTING IMAGES
            </h2>
            {selectedUrls.size > 0 && (
              <span className="brutal-body" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {selectedUrls.size} SELECTED
              </span>
            )}
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative" style={{ flex: 1 }}>
              <Search
                className="brutal-icon"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#6B7280',
                }}
              />
              <input
                type="text"
                placeholder="Search by dish name or image URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="brutal-input w-full"
                style={{
                  padding: '12px 12px 12px 40px',
                  border: '3px solid #000000',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSelectAll}
              className="brutal-button"
              style={{ padding: '12px 16px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
            >
              {allFilteredSelected ? 'DESELECT ALL' : 'SELECT ALL'}
            </button>
          </div>

          {loading ? (
            <div className="brutal-body" style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>
              Loading images...
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="brutal-body" style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>
              {searchQuery ? 'No images found matching your search.' : 'No existing images found.'}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredImages.map((img) => {
                const dishNames = img.dishes.map((d) => d.dishName).join(', ');
                const useCount = img.dishes.length;
                const isSelected = selectedUrls.has(img.url);

                return (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => handleToggleSelect(img.url)}
                    className="brutal-card"
                    style={{
                      padding: '8px',
                      border: isSelected ? '3px solid #FFEB3B' : '3px solid #000000',
                      background: isSelected ? '#FFEB3B' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      position: 'relative',
                      boxShadow: isSelected ? '6px 6px 0px 0px #000000' : '4px 4px 0px 0px #000000',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#FFEB3B';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {/* Selection Checkbox Indicator */}
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '28px',
                          height: '28px',
                          background: '#000000',
                          border: '2px solid #FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                        }}
                      >
                        <Check style={{ width: '18px', height: '18px', color: '#FFEB3B', strokeWidth: 3 }} />
                      </div>
                    )}

                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        background: '#F3F4F6',
                        border: '2px solid #000000',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={img.url}
                        alt={dishNames}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div style="padding: 16px; text-align: center; color: #6B7280; font-size: 0.75rem;">Failed to load</div>';
                          }
                        }}
                      />
                    </div>

                    <div className="brutal-body" style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', lineHeight: '1.2' }}>
                      {img.dishes[0]?.dishName || 'Unknown'}
                      {useCount > 1 && ` +${useCount - 1}`}
                    </div>

                    {useCount > 1 && (
                      <div
                        className="brutal-badge"
                        style={{
                          fontSize: '0.625rem',
                          padding: '2px 6px',
                          background: '#000000',
                          color: '#FFFFFF',
                          display: 'inline-block',
                          marginTop: '4px',
                        }}
                      >
                        Used in {useCount} items
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {filteredImages.length > 0 && (
            <div className="brutal-body mt-4" style={{ fontSize: '0.75rem', color: '#6B7280', textAlign: 'center' }}>
              {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} found
              {selectedUrls.size > 0 && ` • ${selectedUrls.size} selected`}
            </div>
          )}
        </div>

        {/* Fixed Bottom Button Bar */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          style={{
            padding: '16px',
            background: 'rgba(243, 244, 246, 0.95)',
            backdropFilter: 'blur(8px)',
            borderTop: '3px solid #000000',
            boxShadow: '0 -4px 0px 0px #000000',
          }}
        >
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleCancel} className="brutal-button" style={{ padding: '12px 24px', fontSize: '0.875rem' }}>
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedUrls.size === 0}
              className="brutal-button-primary"
              style={{
                padding: '12px 24px',
                fontSize: '0.875rem',
                opacity: selectedUrls.size === 0 ? 0.5 : 1,
                cursor: selectedUrls.size === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ADD SELECTED ({selectedUrls.size})
            </button>
          </div>
        </div>
      </section>
    </PopUp>
  );
};
