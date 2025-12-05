import { base44 } from '@/api/base44Client';

/**
 * Utility para registrar logs de auditoria
 */
export const AuditLogger = {
  async log({ acao, entidade_afetada, entidade_id, detalhes, tenant_id, user }) {
    try {
      if (!tenant_id || !user) return;
      
      await base44.entities.LogAuditoria.create({
        tenant_id,
        usuario_id: user.id,
        usuario_nome: user.full_name || 'Usuário',
        usuario_email: user.email,
        acao,
        entidade_afetada,
        entidade_id,
        detalhes,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging audit:', error);
      // Não bloqueia a operação principal se falhar
    }
  },

  // Helpers para ações comuns
  async logCreate(entidade, entidadeId, detalhes, tenant_id, user) {
    return this.log({
      acao: 'Criar',
      entidade_afetada: entidade,
      entidade_id: entidadeId,
      detalhes,
      tenant_id,
      user
    });
  },

  async logUpdate(entidade, entidadeId, detalhes, tenant_id, user) {
    return this.log({
      acao: 'Atualizar',
      entidade_afetada: entidade,
      entidade_id: entidadeId,
      detalhes,
      tenant_id,
      user
    });
  },

  async logDelete(entidade, entidadeId, detalhes, tenant_id, user) {
    return this.log({
      acao: 'Excluir',
      entidade_afetada: entidade,
      entidade_id: entidadeId,
      detalhes,
      tenant_id,
      user
    });
  },

  async logVote(votacaoId, detalhes, tenant_id, user) {
    return this.log({
      acao: 'Votar',
      entidade_afetada: 'Votacao',
      entidade_id: votacaoId,
      detalhes,
      tenant_id,
      user
    });
  },

  async logCheckin(assembleiaId, detalhes, tenant_id, user) {
    return this.log({
      acao: 'Check-in',
      entidade_afetada: 'Assembleia',
      entidade_id: assembleiaId,
      detalhes,
      tenant_id,
      user
    });
  }
};

export default AuditLogger;