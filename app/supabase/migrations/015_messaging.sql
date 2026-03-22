-- Migration 015: Internal messaging system
-- Conversations, participants, and chat messages

-- 1. Conversations
CREATE TABLE IF NOT EXISTS ivoireio_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'support')),
  title VARCHAR(200),
  context_type VARCHAR(30), -- job_application, dev_outsourcing, portfolio_contact, match
  context_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversation participants
CREATE TABLE IF NOT EXISTS ivoireio_conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ivoireio_conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(conversation_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_profile ON ivoireio_conversation_participants(profile_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON ivoireio_conversation_participants(conversation_id);

-- 3. Chat messages
CREATE TABLE IF NOT EXISTS ivoireio_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ivoireio_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_msgs_conv ON ivoireio_chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_msgs_sender ON ivoireio_chat_messages(sender_id);

-- 4. RLS
ALTER TABLE ivoireio_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivoireio_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivoireio_chat_messages ENABLE ROW LEVEL SECURITY;

-- Conversations: participant can see their conversations
CREATE POLICY conv_participant_select ON ivoireio_conversations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM ivoireio_conversation_participants cp
    WHERE cp.conversation_id = id AND cp.profile_id = auth.uid()
  ));

-- Participants: user can see participants of their conversations
CREATE POLICY conv_part_self ON ivoireio_conversation_participants
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY conv_part_peers ON ivoireio_conversation_participants
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM ivoireio_conversation_participants cp2
    WHERE cp2.conversation_id = conversation_id AND cp2.profile_id = auth.uid()
  ));
CREATE POLICY conv_part_update ON ivoireio_conversation_participants
  FOR UPDATE USING (profile_id = auth.uid());

-- Messages: participant can read/write
CREATE POLICY chat_msg_read ON ivoireio_chat_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM ivoireio_conversation_participants cp
    WHERE cp.conversation_id = conversation_id AND cp.profile_id = auth.uid()
  ));
CREATE POLICY chat_msg_write ON ivoireio_chat_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM ivoireio_conversation_participants cp
    WHERE cp.conversation_id = conversation_id AND cp.profile_id = auth.uid()
  ));

-- Admin policies
CREATE POLICY conv_admin ON ivoireio_conversations FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY conv_part_admin ON ivoireio_conversation_participants FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY chat_msg_admin ON ivoireio_chat_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
