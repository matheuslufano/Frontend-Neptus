# Neptus - Sistema de Monitoramento de Qualidade da Água para Piscicultura

## Contexto do Projeto

O Neptus é um Progressive Web App (PWA) desenvolvido em Next.js que se conecta a um ESP32 via Bluetooth para monitoramento de qualidade da água em tanques de piscicultura. O aplicativo funciona de forma offline-first, armazenando dados localmente no IndexedDB/localStorage e sincronizando com o backend quando há conexão.

### Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui (Radix UI)
- **Autenticação**: NextAuth.js com Credentials Provider
- **Gerenciamento de Estado**:
  - Zustand (estado global com persistência)
  - React Query/TanStack Query (cache e sincronização de dados do servidor)
- **Formulários**: React Hook Form com validação Zod
- **Cliente HTTP**: Axios
- **PWA**: next-pwa (Service Worker)
- **Bluetooth**: Web Bluetooth API (Nordic UART Service - NUS)

### Funcionalidades Já Implementadas

1. **Conexão Bluetooth com ESP32**

   - Conexão via Web Bluetooth API usando protocolo NUS (Nordic UART Service)
   - Service UUID: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
   - Characteristic UUID: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`
   - Nome do dispositivo: `ESP32-Turbidez`
   - Recebimento de dados de turbidez em tempo real
   - Gerenciamento de status de conexão

2. **Gravação de Amostras (Formulários)**

   - Formulário de turbidez com parâmetros adicionais:
     - Turbidez (valor e qualidade)
     - Oxigênio dissolvido
     - Temperatura
     - pH
     - Amônia
     - Cor da água (seletor visual com ColorRangeSelector)
   - Seleção de tanque de peixe
   - Armazenamento local no localStorage (chave: `storagedTurbidityData`)

3. **Histórico de Amostras**

   - Visualização de todas as amostras gravadas
   - Filtro por intervalo de datas
   - Edição e exclusão de amostras
   - Exportação de dados

4. **Gerenciamento de Tanques de Peixe**

   - CRUD completo de tanques
   - Campos: nome, tipo (elevado/escavado), espécie de peixe, quantidade de peixes, peso médio, área do tanque
   - Armazenamento local no localStorage (chave: `tanks`)
   - Tanques padrão iniciais incluídos

5. **Autenticação Offline**

   - Sistema de autenticação que funciona offline
   - Cache de sessão do usuário no localStorage
   - Validação de sessão offline (duração configurável)
   - Suporte a modo de desenvolvimento (desabilita auth)

6. **PWA Offline-First**
   - Service Worker configurado
   - Cache de recursos estáticos
   - Funcionalidade offline completa

### Estrutura do Projeto

```
src/
├── app/
│   ├── (authenticated)/          # Rotas protegidas
│   │   ├── _components/          # Componentes específicos de páginas
│   │   ├── configuracoes/        # Página de configurações
│   │   ├── historico/            # Página de histórico de amostras
│   │   ├── tanques/              # Página de gerenciamento de tanques
│   │   ├── layout.tsx            # Layout autenticado
│   │   └── page.tsx              # Dashboard/home
│   ├── (public)/                 # Rotas públicas
│   │   ├── cadastro/
│   │   ├── login/
│   │   ├── recuperar-senha/
│   │   └── redefinir-senha/
│   ├── api/
│   │   └── auth/[...nextauth]/   # Configuração NextAuth
│   └── layout.tsx                # Layout raiz
├── components/                   # Componentes reutilizáveis
│   ├── forms/                    # Componentes de formulário
│   ├── layout/                   # Componentes de layout
│   ├── ui/                       # Componentes shadcn/ui
│   └── [outros componentes]
├── hooks/                        # Hooks customizados
│   ├── useBluetoothSensorData.ts # Hook de comunicação Bluetooth
│   ├── useTanks.ts               # Hook de gerenciamento de tanques
│   ├── useLogin.ts               # Hook de login
│   └── [outros hooks]
├── lib/                          # Bibliotecas utilitárias
│   ├── axios.ts                  # Configuração do cliente HTTP
│   └── react-query-provider.tsx  # Configuração do Query client
├── schemas/                      # Esquemas de validação Zod
│   ├── turbidity-schema.ts
│   ├── addTank-schema.ts
│   └── login-schema.ts
├── services/                     # Camadas de serviço da API
│   ├── auth-service.ts           # Serviços de autenticação
│   └── bluetooth-service.ts      # Serviço de comunicação Bluetooth
├── stores/                       # Stores Zustand
│   ├── bluetoothConfigStore.ts   # Configuração Bluetooth
│   ├── offlineAuthStore.ts       # Autenticação offline
│   └── offlineDataStore.ts       # Gerenciamento de dados offline
├── types/                        # Definições de tipos TypeScript
│   ├── user-type.ts              # Tipos de usuário
│   └── property-type.ts          # Tipos de propriedade
└── utils/                        # Funções utilitárias
```

### Tipos de Dados Importantes

#### User (user-type.ts)

```typescript
type User = {
  id: string;
  nome: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  perfil_id: string;
  propridedade: Property[];
  total_propriedades: number;
  created_at: string;
  updated_at: string;
};

type UserSession = {
  id: string;
  nome: string;
  email: string;
  is_admin: boolean;
  perfil: string;
  permissoes: string[];
};
```

#### Property (property-type.ts)

```typescript
type Property = {
  id: string;
  nome: string;
  proprietario_id: string;
  proprietario_nome: string;
  total_usuarios: number;
  usuarios: User[];
  created_at: string;
  updated_at: string;
};
```

#### Tank (useTanks.ts)

```typescript
interface Tank {
  id: string;
  name: string;
  type: string; // "elevado" | "escavado"
  fish: string; // espécie do peixe
  fishCount: number;
  averageWeight: number;
  tankArea: number;
  createdAt: string;
}
```

#### Amostra/Turbidity Entry

```typescript
interface StoredTurbidityEntry {
  id: string;
  turbidityData: {
    value: number;
    quality: string;
    timestamp: {
      time: string;
      date: string;
    };
  };
  tank: string;
  oxygen?: number;
  temperature?: number;
  ph?: number;
  ammonia?: number;
  waterColor: number;
}
```

### Armazenamento Local

- **localStorage**:

  - `bluetooth-config-storage`: Configuração Bluetooth
  - `offline-auth-storage`: Dados de autenticação offline
  - `offline-data-storage`: Dados offline (amostras não sincronizadas)
  - `tanks`: Lista de tanques
  - `storagedTurbidityData`: Histórico de amostras de turbidez

- **IndexedDB**: (planejado para sincronização)

### API Backend

- **Base URL**: Configurada via `NEXT_PUBLIC_API_URL`
- **Documentação**: https://docs.neptus.publicvm.com/share/zdm8lrpgbk/p/neptus-documentacao-BVR7NIppdg
- **Tecnologia**: Python Flask
- **Autenticação**: JWT (access_token e refresh_token)

#### Rotas Conhecidas:

- `POST /auth/login` - Login
- `POST /auth/forgot-password` - Recuperação de senha
- `POST /auth/reset-password` - Redefinição de senha

### Fluxo de Autenticação

1. Usuário faz login via `/auth/login`
2. Recebe `access_token`, `refresh_token` e dados do `usuario`
3. NextAuth gerencia a sessão JWT
4. Sessão é armazenada no localStorage para uso offline
5. Middleware verifica autenticação nas rotas protegidas
6. AuthGuard (client-side) valida sessão offline quando necessário

### Fluxo de Dados Bluetooth

1. Usuário clica em "Conectar ao ESP32"
2. Navegador mostra diálogo de seleção de dispositivo Bluetooth
3. Conecta ao dispositivo "ESP32-Turbidez"
4. Ativa notificações na characteristic NUS TX
5. Recebe dados em tempo real via eventos `characteristicvaluechanged`
6. Dados são processados e exibidos no dashboard
7. Usuário pode gravar amostras com os dados recebidos

### Próximas Etapas (Não Implementadas)

1. **Criação da tela de gerenciamento de usuários (com CRUD)** - [FEITO]

   - Listar usuários
   - Criar novo usuário
   - Editar usuário existente
   - Excluir usuário
   - Integração com API backend

2. **Criação da tela de gerenciamento de propriedades (com CRUD)** - [FEITO]

   - Listar propriedades
   - Criar nova propriedade
   - Editar propriedade existente
   - Excluir propriedade
   - Gerenciar usuários da propriedade
   - Integração com API backend

3. **Criação de uma tela para seleção de propriedade ao entrar no aplicativo**

   - Tela de seleção após login
   - Armazenar propriedade selecionada
   - Usar propriedade selecionada nas operações

4. **Criação da lógica de sincronização dos dados (download e upload)**

   - **Download**: No primeiro acesso, baixar dados do servidor e armazenar no IndexedDB
   - **Upload**: Quando online, enviar dados locais não sincronizados para o servidor
   - Gerenciar conflitos de sincronização
   - Indicadores de status de sincronização

5. **Criação de níveis de usuários com permissionamento**

   - Implementar sistema de permissões baseado em `perfil` e `permissoes`
   - Definir níveis de acesso (admin, operador, visualizador, etc.)

6. **Restringir telas e ações de acordo com as permissões do usuário**
   - Ocultar/mostrar rotas baseado em permissões
   - Desabilitar ações não permitidas
   - Mensagens apropriadas para ações restritas

### Padrões de Código

- **TypeScript**: Verificação de tipo estrita
- **Componentes**: Funcionais com hooks
- **Formulários**: React Hook Form + Zod para validação
- **Estado Global**: Zustand com persistência
- **Queries/Mutations**: React Query para operações assíncronas
- **Estilização**: Tailwind CSS + shadcn/ui
- **Nomenclatura**:
  - Componentes: PascalCase
  - Hooks: camelCase com prefixo `use`
  - Stores: camelCase com sufixo `Store`
  - Tipos: PascalCase
  - Constantes: UPPER_SNAKE_CASE

### Configuração de Ambiente

Variáveis de ambiente necessárias:

- `NEXT_PUBLIC_API_URL`: URL base da API backend
- `NEXT_PUBLIC_DEV_MODE`: Modo de desenvolvimento (desabilita auth quando "true")
- Variáveis do NextAuth (NEXTAUTH_URL, NEXTAUTH_SECRET, etc.)

### Observações Importantes

1. **Bluetooth**: Requer HTTPS ou localhost para funcionar
2. **Offline-First**: Sempre considerar funcionamento offline
3. **Sincronização**: Dados devem ser marcados como sincronizados após upload bem-sucedido
4. **Permissões**: Sistema de permissões já existe na estrutura de UserSession, precisa ser implementado
5. **Propriedades**: Usuários podem ter múltiplas propriedades (`propridedade: Property[]`)
6. **IndexedDB**: Planejado para substituir localStorage em dados maiores

### Comandos Úteis

- `npm run dev`: Inicia servidor de desenvolvimento
- `npm run build`: Build de produção
- `npm run start`: Inicia servidor de produção
- `npm run esp32-simulator`: Simula dados do ESP32 (se disponível)
