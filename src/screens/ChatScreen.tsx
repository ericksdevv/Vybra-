import { LinearGradient } from 'expo-linear-gradient';
import { Send } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VybraIconMark } from '../components/brand/VybraLogo';
import {
  AnimatedEntrance,
  InteractivePressable,
  TypingDots,
} from '../components/ui/MotionPrimitives';
import { useVybra } from '../context/VybraContext';
import { FONTS, RADII, SHADOWS } from '../theme/tokens';
import { triggerLightHaptic } from '../utils/haptics';

const QUICK_PROMPTS = [
  'Por que corri menos?',
  'Por que o pace subiu?',
  'Hoje não consegui treinar',
  'Resumo da semana',
];

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const {
    theme,
    chatMessages,
    isAgentTyping,
    reducedMotion,
    sendChatMessage,
  } = useVybra();

  const [draft, setDraft] = useState('');
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);

  const handleSend = (text?: string) => {
    const content = (text ?? draft).trim();
    if (!content) return;
    triggerLightHaptic();
    if (!text) setDraft('');
    sendChatMessage(content);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: !reducedMotion });
    }, 80);
  };

  const accentTextColor = theme.isLight ? theme.colors.primary : theme.colors.secondary;
  const cardShadow = theme.isLight ? SHADOWS.card : undefined;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header limpo do agente (sem subtítulo nem botão de memória) */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top + 12, 22),
            backgroundColor: theme.colors.footerBg,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.agentRow}>
          <VybraIconMark size={38} />
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Agente Vybra
          </Text>
        </View>
      </View>

      {/* Mensagens */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: !reducedMotion })
        }
      >
        {chatMessages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <AnimatedEntrance
              key={msg.id}
              reducedMotion={reducedMotion}
              style={[
                styles.msgRow,
                isAgent ? styles.msgRowLeft : styles.msgRowRight,
              ]}
            >
              {isAgent ? (
                <LinearGradient
                  colors={theme.gradients.cardDepth}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.agentBubble,
                    { borderColor: theme.colors.border },
                    cardShadow,
                  ]}
                >
                  <Text style={[styles.agentText, { color: theme.colors.textPrimary }]}>
                    {msg.text}
                  </Text>
                  {msg.metricCard ? (
                    <View
                      style={[
                        styles.metricSnap,
                        {
                          backgroundColor: theme.isLight
                            ? '#F8FAFC'
                            : 'rgba(10, 9, 18, 0.72)',
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <View style={styles.snapRow}>
                        <View style={styles.snapCol}>
                          <Text style={[styles.snapLabel, { color: theme.colors.textSecondary }]}>
                            {msg.metricCard.leftLabel}
                          </Text>
                          <Text style={[styles.snapValue, { color: theme.colors.textPrimary }]}>
                            {msg.metricCard.leftValue}
                          </Text>
                        </View>
                        <View
                          style={[styles.snapDivider, { backgroundColor: theme.colors.border }]}
                        />
                        <View style={styles.snapCol}>
                          <Text style={[styles.snapLabel, { color: theme.colors.textSecondary }]}>
                            {msg.metricCard.rightLabel}
                          </Text>
                          <Text style={[styles.snapValue, { color: accentTextColor }]}>
                            {msg.metricCard.rightValue}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.snapDelta, { color: theme.colors.success }]}>
                        {msg.metricCard.deltaLabel}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[styles.timeAgent, { color: theme.colors.textMuted }]}>
                    {msg.timestamp}
                  </Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={theme.gradients.brandButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.userBubble}
                >
                  <Text style={[styles.userText, { color: theme.colors.onPrimary }]}>
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.timeUser,
                      { color: theme.colors.onPrimary, opacity: 0.78 },
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </LinearGradient>
              )}
            </AnimatedEntrance>
          );
        })}

        {isAgentTyping ? (
          <View style={[styles.msgRow, styles.msgRowLeft]}>
            <View
              style={[
                styles.typingBubble,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <TypingDots reducedMotion={reducedMotion} />
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Sugestões rápidas e composer */}
      <View
        style={[
          styles.composerArea,
          {
            backgroundColor: theme.colors.footerBg,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptsRow}
        >
          {QUICK_PROMPTS.map((prompt) => (
            <InteractivePressable
              key={prompt}
              onPress={() => handleSend(prompt)}
              style={[
                styles.promptChip,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderStrong,
                },
              ]}
              accessibilityRole="button"
              scaleDown={0.95}
            >
              <Text style={[styles.promptChipText, { color: theme.colors.textSecondary }]}>
                {prompt}
              </Text>
            </InteractivePressable>
          ))}
        </ScrollView>

        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderStrong,
            },
          ]}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Pergunte sobre seu treino ou conte seu dia..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { color: theme.colors.textPrimary }]}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            testID="chat-input"
          />
          <InteractivePressable
            onPress={() => handleSend()}
            style={styles.sendBtnWrap}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            testID="chat-send-btn"
            scaleDown={0.93}
          >
            <LinearGradient
              colors={theme.gradients.brandButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              <Send size={16} color={theme.colors.onPrimary} />
            </LinearGradient>
          </InteractivePressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
  },
  msgRowLeft: {
    justifyContent: 'flex-start',
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },
  agentBubble: {
    maxWidth: '86%',
    borderRadius: RADII.lg,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  agentText: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    lineHeight: 20,
  },
  metricSnap: {
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  snapRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snapCol: {
    flex: 1,
    gap: 2,
  },
  snapDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 10,
  },
  snapLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
  },
  snapValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  snapDelta: {
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  timeAgent: {
    fontFamily: FONTS.regular,
    fontSize: 10.5,
  },
  userBubble: {
    maxWidth: '82%',
    borderRadius: RADII.lg,
    borderTopRightRadius: 6,
    padding: 14,
    gap: 6,
  },
  userText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    lineHeight: 20,
  },
  timeUser: {
    fontFamily: FONTS.regular,
    fontSize: 10.5,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  composerArea: {
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  promptsRow: {
    gap: 8,
  },
  promptChip: {
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  promptChipText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 5,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    minHeight: 40,
  },
  sendBtnWrap: {
    borderRadius: 20,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
