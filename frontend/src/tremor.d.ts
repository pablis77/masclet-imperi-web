/**
 * Declaración de tipos para @tremor/react
 * 
 * Este archivo permite que TypeScript reconozca los componentes de Tremor
 * cuando se utiliza con React 19, aunque Tremor oficialmente solo soporte hasta React 18.
 */

declare module '@tremor/react' {
  import { ReactNode, FC, ComponentProps } from 'react';

  // Card
  export const Card: FC<{
    children?: ReactNode;
    decoration?: 'top' | 'left';
    decorationColor?: string;
    className?: string;
  }>;

  // Text
  export const Text: FC<{
    children?: ReactNode;
    className?: string;
  }>;

  // Metric
  export const Metric: FC<{
    children?: ReactNode;
    className?: string;
  }>;

  // Flex
  export const Flex: FC<{
    children?: ReactNode;
    className?: string;
    justifyContent?: string;
    alignItems?: string;
  }>;

  // ProgressBar
  export const ProgressBar: FC<{
    value: number;
    color?: string;
    className?: string;
  }>;

  // Title
  export const Title: FC<{
    children?: ReactNode;
    className?: string;
  }>;

  // Grid
  export const Grid: FC<{
    children?: ReactNode;
    numItems?: number;
    numItemsSm?: number;
    numItemsLg?: number;
    className?: string;
  }>;

  // Col
  export const Col: FC<{
    children?: ReactNode;
    numColSpan?: number;
    numColSpanSm?: number;
    numColSpanLg?: number;
    className?: string;
  }>;

  // TabGroup, Tab, TabList
  export const TabGroup: FC<{
    children?: ReactNode;
    className?: string;
    index?: number;
    onIndexChange?: (index: number) => void;
  }>;

  export const TabList: FC<{
    children?: ReactNode;
    className?: string;
  }>;

  export const Tab: FC<{
    children?: ReactNode;
    className?: string;
  }>;

  // Badge
  export const Badge: FC<{
    children?: ReactNode;
    color?: string;
    className?: string;
  }>;

  // DonutChart
  export interface DonutChartProps {
    data: any[];
    category: string;
    index: string;
    colors?: string[];
    valueFormatter?: (value: number) => string;
    className?: string;
  }
  export const DonutChart: FC<DonutChartProps>;

  // BarChart
  export interface BarChartProps {
    data: any[];
    index: string;
    categories: string[];
    colors?: string[];
    valueFormatter?: (value: number) => string;
    className?: string;
  }
  export const BarChart: FC<BarChartProps>;

  // List and ListItem
  export const List: FC<{
    children?: ReactNode;
    className?: string;
  }>;

  export const ListItem: FC<{
    children?: ReactNode;
    className?: string;
  }>;

  // Divider
  export const Divider: FC<{
    className?: string;
  }>;
}
