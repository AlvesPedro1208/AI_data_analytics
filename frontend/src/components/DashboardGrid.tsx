import React, { useEffect, useRef, useState } from 'react';
import { Responsive, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Custom WidthProvider implementation to avoid import issues with Vite/RGL v2
const WidthProvider = (ComposedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const [width, setWidth] = useState(1200);
    const elementRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
      const element = elementRef.current;
      if (!element) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(element);
      // Set initial width
      if (element.offsetWidth > 0) {
        setWidth(element.offsetWidth);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <div ref={elementRef} className={props.className} style={{ width: '100%', ...props.style }}>
        {mounted && <ComposedComponent {...props} width={width} />}
      </div>
    );
  };
};

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  children: React.ReactNode;
  layouts: { lg: Layout[]; md: Layout[]; sm: Layout[]; xs: Layout[]; xxs: Layout[] } | any;
  onLayoutChange: (layout: Layout[]) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children, layouts, onLayoutChange }) => {
  // Ensure layouts is not undefined/null to prevent RGL crashes
  const safeLayouts = layouts || { lg: [] };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={safeLayouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={80}
      onLayoutChange={(layout: Layout[]) => onLayoutChange(layout)}
      isDraggable={true}
      isResizable={true}
      draggableHandle=".draggable-handle"
      margin={[16, 16]}
      useCSSTransforms={true}
      preventCollision={false}
      compactType="vertical"
    >
      {children}
    </ResponsiveGridLayout>
  );
};
