import React from 'react';

interface SchemaMarkupProps {
  type: 'Organization' | 'Venue' | 'Event';
  name: string;
  address?: string;
  url?: string;
  logo?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  description?: string;
}

const SchemaMarkup: React.FC<SchemaMarkupProps> = (props) => {
  const { type, name, address, url, logo, eventStartDate, eventEndDate, description } = props;

  const generateSchema = () => {
    const schema: any = { '@context': 'https://schema.org', '@type': type, name };
    if (address) schema.address = address;
    if (url) schema.url = url;
    if (logo) schema.logo = logo;
    if (type === 'Event') {
      schema.startDate = eventStartDate;
      schema.endDate = eventEndDate;
      if (description) schema.description = description;
    }
    return JSON.stringify(schema);
  };

  return (
    <script type='application/ld+json'>
      {generateSchema()}
    </script>
  );
};

export default SchemaMarkup;