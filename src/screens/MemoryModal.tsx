import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AmbientBackground } from '../components/ui/AmbientBackground';
import { InteractivePressable } from '../components/ui/MotionPrimitives';
import { useVybra } from '../context/VybraContext';
import { FONTS, RADII, SHADOWS } from '../theme/tokens';
import { triggerLightHaptic } from '../utils/haptics';

export function MemoryModal() {
  const insets = useSafeAreaInsets();
  const {
    theme,
    memories,
    memoryModalVisible,
    reducedMotion,
    setMemoryModalVisible,
    removeMemoryFact,
    addMemoryFact,
  } = useVybra();

  const [newFact, setNewFact] = useState('');

  if (!memoryModalVisible) return null;

  const handleAdd = () => {
    if (!newFact.trim()) return;
    triggerLightHaptic();
    addMemoryFact(newFact, 'Semântica');
    setNewFact('');
  };

  const accentTextColor = theme.isLight ? theme.colors.primary : theme.colors.secondary;
  const cardShadow = theme.isLight ? SHADOWS.card : undefined;

  return (
    <Modal
      visible={memoryModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setMemoryModalVisible(false)}
    >
      <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
        <AmbientBackground reducedMotion={reducedMotion} />

        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top + 12, 22),
              borderBottomColor: theme.colors.border,
              backgroundColor: theme.colors.footerBg,
            },
          ]}
        >
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              O que o Vybra sabe sobre mim
            </Text>
          </View>
          <InteractivePressable
            onPress={() => setMemoryModalVisible(false)}
            style={[
              styles.closeBtn,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Fechar memória"
            testID="memory-modal-close"
            scaleDown={0.93}
          >
            <X size={18} color={theme.colors.textPrimary} />
          </InteractivePressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.addRow}>
            <TextInput
              value={newFact}
              onChangeText={setNewFact}
              placeholder="Adicionar fato pessoal para o agente lembrar..."
              placeholderTextColor={theme.colors.textMuted}
              style={[
                styles.addInput,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderStrong,
                  color: theme.colors.textPrimary,
                },
              ]}
              onSubmitEditing={handleAdd}
            />
            <InteractivePressable
              onPress={handleAdd}
              style={styles.addBtn}
              accessibilityRole="button"
              accessibilityLabel="Adicionar fato"
              scaleDown={0.94}
            >
              <LinearGradient
                colors={theme.gradients.brandButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Plus size={18} color={theme.colors.onPrimary} />
            </InteractivePressable>
          </View>

          {memories.length === 0 ? (
            <LinearGradient
              colors={theme.gradients.cardDepth}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.emptyCard, { borderColor: theme.colors.border }, cardShadow]}
            >
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                Nenhuma memória salva
              </Text>
              <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
                Adicione um contexto acima ou converse com o Vybra.
              </Text>
            </LinearGradient>
          ) : (
            memories.map((fact) => (
              <LinearGradient
                key={fact.id}
                colors={theme.gradients.cardDepth}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.factCard, { borderColor: theme.colors.border }, cardShadow]}
              >
                <View style={styles.factTop}>
                  <Text style={[styles.factLayer, { color: accentTextColor }]}>
                    {fact.layer}
                  </Text>
                  <Text style={[styles.factDate, { color: theme.colors.textMuted }]}>
                    {fact.date}
                  </Text>
                </View>
                <Text style={[styles.factText, { color: theme.colors.textPrimary }]}>
                  {fact.text}
                </Text>
                <View style={[styles.factFooter, { borderTopColor: theme.colors.border }]}>
                  <Text style={[styles.factSensitivity, { color: theme.colors.textSecondary }]}>
                    {fact.sensitive ? 'Dado sensível (criptografado)' : 'Contexto pessoal'}
                  </Text>
                  <InteractivePressable
                    onPress={() => {
                      triggerLightHaptic();
                      removeMemoryFact(fact.id);
                    }}
                    style={styles.deleteBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Apagar memória: ${fact.text}`}
                    scaleDown={0.94}
                  >
                    <Trash2 size={14} color={theme.colors.danger} />
                    <Text style={[styles.deleteText, { color: theme.colors.danger }]}>
                      Apagar
                    </Text>
                  </InteractivePressable>
                </View>
              </LinearGradient>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  addInput: {
    flex: 1,
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: FONTS.regular,
    fontSize: 13.5,
  },
  addBtn: {
    width: 46,
    borderRadius: RADII.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  emptySub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    textAlign: 'center',
  },
  factCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 15,
    gap: 8,
  },
  factTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factLayer: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  factDate: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
  },
  factText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    lineHeight: 19,
  },
  factFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
  },
  factSensitivity: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  deleteText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
});
