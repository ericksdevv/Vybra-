import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { COLORS } from '../../theme/tokens';
import { SportType } from '../../types/vybra';

interface IconProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

/** Tênis com linhas de velocidade — fiel à prancha oficial (Corrida) */
export function ShoeRunIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.2 15.8 L9.5 8.5 L12.4 10.6 C13.9 12.1 16.4 12.9 19.6 13.2 C20.8 13.3 21.6 14.2 21.6 15.3 V16.9 C21.6 17.7 21 18.2 20.1 18.2 H5.2 C4.2 18.2 3.6 17.3 4.2 15.8 Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <Path d="M4.3 15.7 H21.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path
        d="M2 8.8 H6.4 M1.4 11.6 H4.8"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Corredor em movimento — fiel ao botão quadrado roxo de ELEMENTOS DE UI */
export function RunnerActionIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="15.5" cy="4.8" r="2" fill={color} />
      <Path
        d="M9.5 8.5 L13.2 7.8 L16.2 10.5 L19.2 9.2 M13.2 8.2 L10.8 13.2 L14.5 15.4 L16.2 20 M10.8 13.2 L7.5 15.8 L5 19"
        stroke={color}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.5 10.5 H6.2 M3.2 13.5 H5.8"
        stroke={accentColor}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Ciclista geométrico — fiel à prancha oficial */
export function CyclingIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="5.8" cy="16.8" r="3.3" stroke={color} strokeWidth="1.9" />
      <Circle cx="18.2" cy="16.8" r="3.3" stroke={color} strokeWidth="1.9" />
      <Circle cx="14.5" cy="5.2" r="1.8" fill={accentColor} />
      <Path
        d="M12.2 8.2 L9.4 11.8 L13.4 13.4 L12.8 17.2 M12.2 8.2 L15.8 10.8 H18.5"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Halter minimalista — fiel à prancha oficial */
export function DumbbellIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.2 12 H16.8"
        stroke={accentColor}
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <Rect x="4.5" y="7.2" width="2.7" height="9.6" rx="1.1" stroke={color} strokeWidth="1.8" />
      <Rect x="16.8" y="7.2" width="2.7" height="9.6" rx="1.1" stroke={color} strokeWidth="1.8" />
      <Path d="M2.3 9.4 V14.6 M21.7 9.4 V14.6" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    </Svg>
  );
}

/** Pino com trajeto em roxo — fiel à prancha oficial (Rotas) */
export function RoutePinIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 13.2 C13.6 10.7 15.2 8.6 15.2 6.6 A4.2 4.2 0 1 0 6.8 6.6 C6.8 8.6 8.4 10.7 11 13.2 Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <Circle cx="11" cy="6.6" r="1.5" fill={color} />
      <Path
        d="M6.2 18.6 C9.5 16 13.2 20.4 18.2 16.4"
        stroke={accentColor}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <Circle cx="18.2" cy="16.4" r="1.6" fill={accentColor} />
    </Svg>
  );
}

/** Montanha / Trilha (Trail Run) */
export function TrailMountainIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 18.5 L9.8 6.5 L14.5 14.2 L17.2 10.2 L21.2 18.5 Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <Path
        d="M7.6 10.6 L9.8 12 L11.8 10.4"
        stroke={accentColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Natação / Ondas */
export function SwimWaveIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="15.5" cy="6.5" r="1.8" fill={color} />
      <Path
        d="M6.5 12.2 L11.2 9.2 L14.8 11.5 L18.2 9.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 16 C5.2 14.5 7.2 14.5 9.4 16 C11.6 17.5 13.6 17.5 15.8 16 C17.8 14.6 19.5 14.6 21 16"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M3 19.5 C5.2 18 7.2 18 9.4 19.5 C11.6 21 13.6 21 15.8 19.5 C17.8 18.1 19.5 18.1 21 19.5"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Barras de estatísticas — fiel à prancha oficial */
export function StatsBarsIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4.2" y="13" width="3.6" height="7" rx="1.3" fill={color} />
      <Rect x="10.2" y="8.2" width="3.6" height="11.8" rx="1.3" fill={accentColor} />
      <Rect x="16.2" y="4" width="3.6" height="16" rx="1.3" fill={color} />
    </Svg>
  );
}

/** Troféu de conquistas — fiel à prancha oficial */
export function TrophyIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 4.5 H17 V10 C17 12.8 14.8 15 12 15 C9.2 15 7 12.8 7 10 Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <Path
        d="M7 6.5 H4.5 C4.5 9.5 5.5 11 7 11 M17 6.5 H19.5 C19.5 9.5 18.5 11 17 11"
        stroke={accentColor}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path d="M12 15 V19 M8.5 19.5 H15.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    </Svg>
  );
}

/** Ícone da aba Visão Geral — dashboard com destaque roxo */
export function OverviewIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="3.5" width="7.4" height="7.4" rx="2.2" stroke={color} strokeWidth="1.9" />
      <Rect x="13.1" y="3.5" width="7.4" height="7.4" rx="2.2" fill={accentColor} />
      <Rect x="3.5" y="13.1" width="7.4" height="7.4" rx="2.2" stroke={color} strokeWidth="1.9" />
      <Rect x="13.1" y="13.1" width="7.4" height="7.4" rx="2.2" stroke={color} strokeWidth="1.9" />
    </Svg>
  );
}

/** Ícone da aba Chat — diálogo com onda de ritmo */
export function PulseChatIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.2 6.5 C4.2 5.1 5.3 4 6.7 4 H17.3 C18.7 4 19.8 5.1 19.8 6.5 V14.2 C19.8 15.6 18.7 16.7 17.3 16.7 H10.6 L6 20.2 V16.7 H6.7 C5.3 16.7 4.2 15.6 4.2 14.2 Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <Path
        d="M7.6 10.4 H9.8 L11.3 7.6 L13.1 12.8 L14.5 10.4 H16.5"
        stroke={accentColor}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Ícone de caminhada */
export function WalkIcon({
  size = 22,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="13" cy="4.8" r="1.9" fill={accentColor} />
      <Path
        d="M12.3 8.2 L9.8 13.5 L7.8 19.2 M12.3 8.2 L14.5 13.2 L16.6 19.2 M8.8 11 L12.3 8.6 L16 11.4"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Engrenagem mecânica sólida de 8 dentes — fiel ao ícone de Configurações
 * da seção ELEMENTOS DE UI da prancha oficial (sem raios soltos tipo sol).
 */
export function GearIcon({ size = 22, color = COLORS.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.35 2.4 C10.52 1.85 11.02 1.5 11.6 1.5 H12.4 C12.98 1.5 13.48 1.85 13.65 2.4 L14.12 3.92 C14.68 4.12 15.21 4.39 15.7 4.72 L17.16 4.02 C17.68 3.77 18.3 3.88 18.71 4.29 L19.27 4.85 C19.68 5.26 19.79 5.88 19.54 6.4 L18.84 7.86 C19.17 8.35 19.44 8.88 19.64 9.44 L21.16 9.91 C21.71 10.08 22.06 10.58 22.06 11.16 V11.96 C22.06 12.54 21.71 13.04 21.16 13.21 L19.64 13.68 C19.44 14.24 19.17 14.77 18.84 15.26 L19.54 16.72 C19.79 17.24 19.68 17.86 19.27 18.27 L18.71 18.83 C18.3 19.24 17.68 19.35 17.16 19.1 L15.7 18.4 C15.21 18.73 14.68 19.0 14.12 19.2 L13.65 20.72 C13.48 21.27 12.98 21.62 12.4 21.62 H11.6 C11.02 21.62 10.52 21.27 10.35 20.72 L9.88 19.2 C9.32 19.0 8.79 18.73 8.3 18.4 L6.84 19.1 C6.32 19.35 5.7 19.24 5.29 18.83 L4.73 18.27 C4.32 17.86 4.21 17.24 4.46 16.72 L5.16 15.26 C4.83 14.77 4.56 14.24 4.36 13.68 L2.84 13.21 C2.29 13.04 1.94 12.54 1.94 11.96 V11.16 C1.94 10.58 2.29 10.08 2.84 9.91 L4.36 9.44 C4.56 8.88 4.83 8.35 5.16 7.86 L4.46 6.4 C4.21 5.88 4.32 5.26 4.73 4.85 L5.29 4.29 C5.7 3.88 6.32 3.77 6.84 4.02 L8.3 4.72 C8.79 4.39 9.32 4.12 9.88 3.92 L10.35 2.4 Z M12 15.1 C13.93 15.1 15.5 13.53 15.5 11.6 C15.5 9.67 13.93 8.1 12 8.1 C10.07 8.1 8.5 9.67 8.5 11.6 C8.5 13.53 10.07 15.1 12 15.1 Z"
        fill={color}
      />
    </Svg>
  );
}

export function SportIcon({
  sport,
  size = 20,
  color = COLORS.white,
  accentColor = COLORS.secondary,
}: {
  sport: SportType;
  size?: number;
  color?: string;
  accentColor?: string;
}) {
  switch (sport) {
    case 'corrida':
      return <ShoeRunIcon size={size} color={color} accentColor={accentColor} />;
    case 'ciclismo':
      return <CyclingIcon size={size} color={color} accentColor={accentColor} />;
    case 'treino':
      return <DumbbellIcon size={size} color={color} accentColor={accentColor} />;
    case 'caminhada':
      return <WalkIcon size={size} color={color} accentColor={accentColor} />;
    case 'trilha':
      return <TrailMountainIcon size={size} color={color} accentColor={accentColor} />;
    case 'natacao':
      return <SwimWaveIcon size={size} color={color} accentColor={accentColor} />;
  }
}
