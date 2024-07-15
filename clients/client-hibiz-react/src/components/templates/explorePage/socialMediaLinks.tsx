import SubHeader from '@/components/atom/subHeader';
import { memo, useState, useEffect, type ChangeEvent, useRef } from 'react';

interface ISocialMediaLinks {
  selectedSocialMedia: string;
  handleIconClick: (icon: string) => void;
  handleSaveSocialMediaLink: (e: ChangeEvent<HTMLInputElement>) => void;
  socialMediaLinks: { _id: number, icon: string, logo: JSX.Element, link: string }[];
}

const MemoSocialMediaLinks = (props: ISocialMediaLinks) => {
  const { selectedSocialMedia, handleIconClick, handleSaveSocialMediaLink, socialMediaLinks } = props;
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const socialMediaRef = useRef(false);
  
  useEffect(() => {
    if(!socialMediaRef.current){
      const selectedLink = socialMediaLinks.find(link => link.icon === selectedSocialMedia);
      setInputValue(selectedLink ? selectedLink.link : '');
      socialMediaRef.current= true
    }
  }, [selectedSocialMedia, socialMediaLinks,socialMediaRef.current]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!e.target.value.startsWith('https://')) {
      setError('URL must start with "https://"');
    } else {
      setError('');
    }
    handleSaveSocialMediaLink(e)
  };

  return (
    <>
      <SubHeader text='Social Media Links' />
      <section className='bg-white rounded-2xl'>
        <article className='flex items-center justify-between p-6 '>
          {socialMediaLinks.map((link) => (
            <div
              key={link._id}
              onClick={() => handleIconClick(link.icon)}
              className={`${selectedSocialMedia === link.icon ? 'bg-black text-white' : 'bg-gray-100'} h-10 w-10 rounded-full flex justify-center items-center`}
            >
              {link.logo}
            </div>
          ))}
        </article>
        {selectedSocialMedia.length === 0 ? null : (
          <article className='pb-4 mx-6 space-y-4 rounded-2xl'>
            <input
              value={inputValue}
              onChange={handleChange}
              placeholder={`Enter ${selectedSocialMedia} link`}
              type="text"
              className='w-full rounded-2xl'
            />
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </article>
        )}
      </section>
    </>
  );
};

const SocialMediaLinks = memo(MemoSocialMediaLinks);
export default SocialMediaLinks;