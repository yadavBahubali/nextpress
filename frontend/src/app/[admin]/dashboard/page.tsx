"use client";

import React, { useEffect, useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableBlock } from "@/components/admin/dashboard/SortableBlock";
import EcommerceBlock from "@/components/admin/dashboard/EcommerceBlock";
import SalesBlock from "@/components/admin/dashboard/SalesBlock";
import HrBlock from "@/components/admin/dashboard/HrBlock";
import GeneralBlock from "@/components/admin/dashboard/GeneralBlock";
import { settingsService } from "@/services/settings.service";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({});
  const [blockOrder, setBlockOrder] = useState<string[]>(['general']);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // 1. Fetch active modules
        const modRes = await settingsService.getSystemModules();
        const modMap: Record<string, boolean> = {};
        if (modRes && modRes.data) {
          modRes.data.forEach((m: any) => {
            modMap[m.module_key] = m.is_enabled === 1;
          });
        }
        setActiveModules(modMap);

        // 2. Fetch saved layout order
        const orderRes = await settingsService.getSetting('dashboard_layout');
        
        let initialOrder = ['general'];
        if (modMap.ecommerce) initialOrder.push('ecommerce');
        if (modMap.sales_leads) initialOrder.push('sales');
        if (modMap.hr_careers) initialOrder.push('hr');

        if (orderRes.success && orderRes.data) {
          try {
            const savedOrder = typeof orderRes.data === 'string' ? JSON.parse(orderRes.data) : orderRes.data;
            // Filter out any modules that might have been disabled since last save
            const validSavedOrder = savedOrder.filter((id: string) => initialOrder.includes(id));
            
            // Add any newly enabled modules that aren't in the saved order
            const missingModules = initialOrder.filter(id => !validSavedOrder.includes(id));
            
            setBlockOrder([...validSavedOrder, ...missingModules]);
          } catch (e) {
            setBlockOrder(initialOrder);
          }
        } else {
          setBlockOrder(initialOrder);
        }
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setBlockOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save new order to database silently
        settingsService.saveSetting('dashboard_layout', JSON.stringify(newOrder), 'general')
          .catch(console.error);
          
        return newOrder;
      });
    }
  };

  const renderBlock = (id: string) => {
    switch (id) {
      case 'general': return <GeneralBlock />;
      case 'ecommerce': return <EcommerceBlock />;
      case 'sales': return <SalesBlock />;
      case 'hr': return <HrBlock />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-4">
        <h2 className="fw-bold">Dashboard</h2>
        <p className="text-muted">Drag the grip icons to reorder your workspace.</p>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={blockOrder}
          strategy={verticalListSortingStrategy}
        >
          {blockOrder.map((id) => (
            <SortableBlock key={id} id={id}>
              {renderBlock(id)}
            </SortableBlock>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
