import React from 'react';
import MenuWorkspace from './_components/layout/MenuWorkspace';
import MenuList from './_components/layout/MenuList';

export const metadata = {
  title: 'Menus | NextPress Admin',
  description: 'Navigation management system',
};

export default async function MenusPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const awaitedSearchParams = await searchParams;
  const menuId = awaitedSearchParams.id ? parseInt(awaitedSearchParams.id) : undefined;

  return (
    <div className="menus-page-root">
      {menuId ? (
        <MenuWorkspace menuId={menuId} />
      ) : (
        <MenuList />
      )}
    </div>
  );
}
