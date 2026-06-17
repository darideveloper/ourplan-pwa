import React from 'react';
import { ValidatedRadioGroup } from '../atoms/ValidatedRadioGroup';
import { useFormStore } from '@/store/form';

export const ParentHealthRadioGroup = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const parentName = useFormStore((state) => state.parent_name);
  const displayName = mounted && parentName ? parentName : 'their';

  return (
    <ValidatedRadioGroup 
      field="parent_health" 
      label={`How would you describe ${displayName}’s current health?`}
      options={[
        { value: 'independent', label: 'Doing great, completely independent.' },
        { value: 'slowing_down', label: 'Managing fine, but starting to slow down.' },
        { value: 'frail', label: 'Facing noticeable physical or cognitive challenges.' },
        { value: 'crisis', label: 'In a bit of a health crisis right now.' },
      ]}
    />
  );
};
