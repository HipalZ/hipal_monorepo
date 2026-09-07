import BottomButton from '@/components/atom/bottomButton';
import Background from '@/components/atom/feildBackground';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import useMenuPageStore, { dayIndex } from '@/components/store/useMenuStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storeImageAfterSave } from '@/components/utils/helper';
import { useDeleteCategory, useUpdateCategory } from '@/hooks/useCategory';
import { Switch } from '@headlessui/react';
import { X } from 'lucide-react';

import { memo, useCallback, type ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { BiImageAdd } from 'react-icons/bi';
import { useParams } from 'react-router-dom';
import LinkingCategoryComp from './linkingCategoryComp';

const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;
const MIME_TYPE = 'image/jpeg';
const QUALITY = 0.9;

const MemoEditCategory = () => {
  const removeTiming = useMenuPageStore((s) => s.removeTiming);
  const addTiming = useMenuPageStore((s) => s.addTiming);
  const updateTiming = useMenuPageStore((s) => s.updateTiming);
  const timings = useMenuPageStore((s) => s.timings);
  const selectSingleParentCat = useMenuPageStore((s) => s.selectSingleParentCat);
  const setIsCatDelete = useMenuPageStore((s) => s.setIsCatDelete);
  const isCatDelete = useMenuPageStore((s) => s.isCatDelete);
  const isMenuManager = useMenuPageStore((s) => s.isMenuManager);
  const setIsLoading = useMenuPageStore((s) => s.setIsLoading);
  const isLoading = useMenuPageStore((s) => s.isLoading);
  const removeRecommendationIds = useMenuPageStore((s) => s.removeRecommendationIds);
  const recommendationIds = useMenuPageStore((s) => s.recommendationIds);
  const idCheck = useMenuPageStore((s) => s.idCheck);
  const setCategoryName = useMenuPageStore((s) => s.setCategoryName);
  const categoryName = useMenuPageStore((s) => s.categoryName);
  const setCategoryInfo = useMenuPageStore((s) => s.setCategoryInfo);
  const categoryInfo = useMenuPageStore((s) => s.categoryInfo);
  const setSelectedFile = useMenuPageStore((s) => s.setSelectedFile);
  const selectedFile = useMenuPageStore((s) => s.selectedFile);
  const setImagePreview = useMenuPageStore((s) => s.setImagePreview);
  const imagePreview = useMenuPageStore((s) => s.imagePreview);
  const catId = useMenuPageStore((s) => s.catId);
  const visibility = useMenuPageStore((s) => s.visibility);
  const setVisibility = useMenuPageStore((s) => s.setVisibility);
  const categoryStep = useMenuPageStore((s) => s.categoryStep);
  const selectIds = useMenuPageStore((s) => s.selectedIds);

  const { mutate, isPending } = useUpdateCategory();
  const { isPending: deletePending, mutate: deleteCat } = useDeleteCategory();

  const { businessId, menuId } = useParams<{
    businessId: string;
    menuId: string;
  }>();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      compressImage(file);
    }
  };

  const compressImage = useCallback(
    (file: File) => {
      const blobURL = URL.createObjectURL(file);
      const img = new Image();
      img.src = blobURL;
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
      };
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const [newWidth, newHeight] = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: MIME_TYPE,
                  lastModified: Date.now(),
                });
                setSelectedFile(compressedFile);
                const reader = new FileReader();
                reader.onload = () => {
                  if (reader.result) {
                    setImagePreview(reader.result as string);
                  }
                };
                reader.readAsDataURL(compressedFile);
              }
            },
            MIME_TYPE,
            QUALITY,
          );
        }
      };
    },
    [setImagePreview, setSelectedFile],
  );

  const calculateSize = useCallback((img: HTMLImageElement, maxWidth: number, maxHeight: number) => {
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }
    return [width, height];
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setSelectedFile(null);
    const inputElement = document.getElementById('cat') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
  }, [setImagePreview, setSelectedFile]);

  const getRemovedIds = (prevIds: string[], newIds: string[]) => {
    return prevIds.filter((id) => !newIds.includes(id));
  };

  const handleSave = async () => {
    let imageUrl = imagePreview || '';
    if (selectedFile) {
      imageUrl = await storeImageAfterSave(selectedFile, imagePreview, setIsLoading);
    }
    const removedCatIds = getRemovedIds(idCheck, categoryStep === 'EDIT_MAIN_CATEGORY' ? selectIds : selectSingleParentCat);
    const removeDishIds = getRemovedIds(removeRecommendationIds, recommendationIds);

    const commonPayload = {
      name: categoryName,
      businessId: businessId || '',
      menuId: menuId,
      coverImage: imageUrl,
      visibility: visibility,
      _id: catId,
      timings,
      categoryInfo,
    };

    const payload =
      categoryStep === 'EDIT_MAIN_CATEGORY'
        ? {
            ...commonPayload,
            subCategoryIds: selectIds,
            removeSubCategoryIds: removedCatIds,
          }
        : {
            ...commonPayload,
            parentCategoryIds: selectSingleParentCat || [],
            removeParentCategoryIds: removedCatIds,
            dishIds: recommendationIds,
            removeDishIds: removeDishIds,
          };
    console.log('Payload to update category:', payload);
    mutate(payload);
  };

  if (isPending || isLoading || deletePending) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Image Upload */}
      <article className="mx-6 lg:flex">
        <section className="flex-1">
          <h1 className="font-semibold opacity-50"> Category Image</h1>
          <Background>
            <div className="mx-4 flex justify-between gap-4">
              <div className="h-[7rem] w-[7rem] rounded-full">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-[7rem] w-[7rem] rounded-full object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full"
                    style={{
                      background: 'linear-gradient(45deg, #D9CCFF, #FCD6CF)',
                    }}
                  >
                    <BiImageAdd className="text-gray-600 opacity-50" size={36} />
                  </div>
                )}
              </div>
              <div className="flex w-1/2 flex-col items-center justify-center">
                <input type="file" id="cat" className="hidden" onChange={handleImageChange} />
                <button
                  type="button"
                  className="mb-2 w-full rounded-2xl bg-black p-2 text-white"
                  onClick={() => document.getElementById('cat')?.click()}
                >
                  Add Image
                </button>
                <button type="button" className="w-full rounded-2xl border border-black bg-white p-2 text-black" onClick={handleRemoveImage}>
                  Remove
                </button>
              </div>
            </div>
          </Background>
        </section>

        {!isMenuManager && (
          <section className="flex-1">
            <article className="lg:mx-4 mb-4">
              <label className="font-semibold opacity-50" htmlFor="name">
                Category Name*
              </label>
              <Background>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter Category Name"
                  value={categoryName}
                  maxLength={21}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full rounded-xl border border-black bg-white p-2 focus:border-[#8C63FF] focus:bg-white focus:ring-0"
                />
              </Background>
            </article>

            <article className="lg:mx-4">
              <label className="font-semibold opacity-50" htmlFor="info">
                Category Info (Optional)
              </label>
              <Background>
                <input
                  type="text"
                  id="info"
                  placeholder="Enter Category Description"
                  value={categoryInfo}
                  maxLength={120}
                  onChange={(e) => setCategoryInfo(e.target.value)}
                  className="w-full rounded-xl border border-black bg-white p-2 focus:border-[#8C63FF] focus:bg-white focus:ring-0"
                />
              </Background>
            </article>
          </section>
        )}
      </article>

      {/* Visibility */}
      <section className="mx-6 gap-4 lg:flex">
        <article className="my-4 flex justify-between rounded-full bg-white px-4 py-3 lg:mt-6 lg:flex-1">
          <h1 className="font-semibold opacity-50">Category visibility</h1>
          <Switch
            checked={visibility}
            onChange={setVisibility}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </article>
      </section>

      {/* Timings */}
      <section className="mx-6 my-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Schedule</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {timings.map((t, i) => (
            <Card key={i} className="relative flex items-center space-x-4 p-4 shadow-none">
              <CardHeader className="w-[3rem] p-0">
                <CardTitle className="text-sm font-medium">Slot {i + 1}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-wrap items-center gap-3 p-0">
                <Select
                  value={String(t.day)}
                  onValueChange={(val) => {
                    const day = Number(val);

                    updateTiming(i, { day });
                  }}
                  className="w-28"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dayIndex).map(([label, val]) => (
                      <SelectItem key={val} value={String(val)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="time"
                  value={`${String(Math.floor(t.start / 60)).padStart(2, '0')}:${String(t.start % 60).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    updateTiming(i, { start: h * 60 + m });
                  }}
                  className="w-24"
                />

                <Input
                  type="time"
                  value={`${String(Math.floor(t.end / 60)).padStart(2, '0')}:${String(t.end % 60).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    updateTiming(i, { end: h * 60 + m });
                  }}
                  className="w-20"
                />

                <Button variant="ghost" size="icon" onClick={() => removeTiming(i)} className="absolute bottom-0 right-0">
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => addTiming({ day: 0, start: 0, end: 60 })}
        >
          + Add Slot
        </Button>
      </section>

      {/* Linking Categories */}
      <section className="mx-6">
        <LinkingCategoryComp />
      </section>

      {/* Footer */}
      {isCatDelete ? (
        <BottomButton
          buttons={[
            {
              text: 'Cancel',
              onClick: () => setIsCatDelete(false),
              type: 'button',
            },
            {
              text: 'Confirm Delete',
              onClick: () => deleteCat(catId),
              type: 'button',
              delete: true,
            },
          ]}
        />
      ) : (
        <BottomButton buttons={[{ text: 'Update', onClick: handleSave, type: 'button' }]} />
      )}
    </>
  );
};

const EditMainCategory = memo(MemoEditCategory);
export default EditMainCategory;
