import { useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Conference',
  'Workshop',
  'Concert',
  'Sports',
  'Networking',
  'Festival',
  'Webinar',
  'Other',
];

const toDateTimeLocal = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

export default function EventForm({ initialValues, onSubmit, submitting, submitLabel = 'Publish event' }) {
  const [values, setValues] = useState({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    category: initialValues?.category || 'Conference',
    date: toDateTimeLocal(initialValues?.date) || '',
    capacity: initialValues?.capacity || 50,
    price: initialValues?.price || 0,
    venue: initialValues?.location?.venue || '',
    city: initialValues?.location?.city || '',
    isOnline: initialValues?.location?.isOnline || false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initialValues?.image?.url || '');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('category', values.category);
    formData.append('date', new Date(values.date).toISOString());
    formData.append('capacity', values.capacity);
    formData.append('price', values.price);
    formData.append('location[venue]', values.venue);
    formData.append('location[city]', values.city);
    formData.append('location[isOnline]', values.isOnline);
    if (imageFile) formData.append('image', imageFile);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="label" htmlFor="image">Cover image</label>
        <label
          htmlFor="image"
          className="flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-plum-200 bg-plum-50 transition-colors hover:border-plum-400"
        >
          {preview ? (
            <img src={preview} alt="Cover preview" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-plum-500">
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Click to upload a cover image</span>
            </span>
          )}
        </label>
        <input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      <div>
        <label className="label" htmlFor="title">Event title</label>
        <input
          id="title" name="title" className="input" required maxLength={120}
          value={values.title} onChange={handleChange} placeholder="Annual Tech Summit"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          id="description" name="description" className="input min-h-[120px]" required
          value={values.description} onChange={handleChange}
          placeholder="What should attendees expect?"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" className="input" value={values.category} onChange={handleChange}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">Date &amp; time</label>
          <input
            id="date" name="date" type="datetime-local" className="input" required
            value={values.date} onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="venue">Venue</label>
          <input
            id="venue" name="venue" className="input" required
            value={values.venue} onChange={handleChange} placeholder="Grand Convention Hall"
          />
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <input
            id="city" name="city" className="input" required
            value={values.city} onChange={handleChange} placeholder="Austin"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="capacity">Capacity</label>
          <input
            id="capacity" name="capacity" type="number" min={1} className="input" required
            value={values.capacity} onChange={handleChange}
          />
        </div>
        <div>
          <label className="label" htmlFor="price">Ticket price (USD)</label>
          <input
            id="price" name="price" type="number" min={0} step="0.01" className="input"
            value={values.price} onChange={handleChange}
          />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox" name="isOnline" checked={values.isOnline} onChange={handleChange}
              className="h-4 w-4 rounded border-plum-300 text-plum-700 focus:ring-plum-400"
            />
            This is an online event
          </label>
        </div>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
