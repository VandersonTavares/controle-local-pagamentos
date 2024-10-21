<template>
  <div class="container">
    <!-- Seção do formulário -->
    <div class="form-section card">
      <h2>Cadastro de Pagamento</h2>
      <form @submit.prevent="submitForm" class="p-fluid">
        <!-- Campos do formulário -->
        <div class="p-field">
          <label for="nome">Nome:</label>
          <InputText
            v-model="form.nome"
            id="nome"
            required
            placeholder="Digite o nome completo"
          />
        </div>

        <div class="p-field">
          <label for="dataPagamento">Data de Pagamento:</label>
          <Calendar
            v-model="form.dataPagamento"
            id="dataPagamento"
            dateFormat="dd/mm/yy"
            showIcon
            required
          />
        </div>

        <div class="p-field">
          <label for="mesReferente">Mês Referente:</label>
          <Calendar
            v-model="form.mesReferente"
            id="mesReferente"
            view="month"
            dateFormat="mm/yy"
            showIcon
            required
          />
        </div>

        <div class="p-field">
          <label for="valor">Valor:</label>
          <InputNumber
            v-model="form.valor"
            id="valor"
            mode="currency"
            currency="BRL"
            required
            placeholder="R$ 0,00"
          />
        </div>

        <div class="p-field">
          <label for="nomeAluno">Nome do Aluno:</label>
          <InputText
            v-model="form.nomeAluno"
            id="nomeAluno"
            required
            placeholder="Nome do aluno"
          />
        </div>

        <Button label="Enviar" type="submit" class="p-button-success p-mt-3" />

        <!-- Exibe a soma dos pagamentos -->
        <p class="total-pagamentos">
          Total de Pagamentos: R$ {{ totalPagamentos.toFixed(2) }}
        </p>

        <input
          type="file"
          accept=".json"
          @change="handleFileUpload"
          style="display: none"
          ref="fileInput"
        />
      </form>
    </div>

    <!-- Seção de busca e listagem dos clientes filtrados -->
    <div class="card-section">
      <div class="search-section">
        <InputText
          v-model="searchQuery"
          placeholder="Buscar por nome"
          class="search-input"
        />
        <div class="datajson">
          <Button
            label="Exportar para JSON"
            @click="exportToJson"
            class="p-button-info"
          />
          <Button
            label="Importar JSON"
            @click="importJson"
            class="p-button-warning"
          />
        </div>
      </div>

      <div class="cards-list">
        <div
          v-for="(client, index) in filteredClients"
          :key="index"
          class="card-item"
        >
          <Card style="width: 100%; overflow: hidden; position: relative">
            <template #title>{{ client.nome }}</template>
            <template #subtitle>
              <p>
                Mês Referente:
                <span class="bold">{{ client.mesReferente }}</span>
              </p>
              <p>
                Data Pagamento:
                <span class="bold">{{ client.dataPagamento }}</span>
              </p>
            </template>
            <template #content>
              <p>
                Valor: <span class="bold">R${{ client.valor }}</span>
              </p>
              <p>Aluno: {{ client.nomeAluno }}</p>
            </template>
            <template #footer>
              <div class="button-group">
                <Button label="Pago" class="p-button-success" />
                <button class="delete-button" @click="deleteTask(index)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import InputNumber from "primevue/inputnumber";

// Função para capitalizar a primeira letra
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Função para formatar a data no formato dd/mm/yyyy
function formatDateToBrazilian(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const form = ref({
  nome: "",
  dataPagamento: "",
  mesReferente: "",
  valor: "",
  nomeAluno: "",
});

const fileInput = ref(null);

const clients = ref([]);

const searchQuery = ref("");

const filteredClients = computed(() => {
  return clients.value.filter((client) =>
    client.nome.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const submitForm = () => {
  const options = { month: "long" };
  const mesReferenteDate = new Date(form.value.mesReferente + "-01");
  let mesReferenteFormatado = mesReferenteDate.toLocaleDateString(
    "pt-BR",
    options
  );

  // Capitaliza a primeira letra do mês
  mesReferenteFormatado = capitalizeFirstLetter(mesReferenteFormatado);

  // Formata a data de pagamento no formato dd/mm/yyyy
  const dataPagamentoFormatada = formatDateToBrazilian(
    form.value.dataPagamento
  );

  clients.value.push({
    ...form.value,
    mesReferente: mesReferenteFormatado,
    dataPagamento: dataPagamentoFormatada,
  });

  form.value = {
    nome: "",
    dataPagamento: "",
    mesReferente: "",
    valor: "",
    nomeAluno: "",
  };
  setTaskLocal();
};

const setTaskLocal = () => {
  localStorage.setItem("controle-pix", JSON.stringify(clients.value));
};

const loadTaskLocal = () => {
  const savedLocal = localStorage.getItem("controle-pix");
  if (savedLocal) {
    clients.value = JSON.parse(savedLocal);
  }
};

const deleteTask = (index) => {
  clients.value.splice(index, 1);
  setTaskLocal();
};

const totalPagamentos = computed(() => {
  return clients.value.reduce(
    (total, client) => total + parseFloat(client.valor) || 0,
    0
  );
});

const exportToJson = () => {
  const jsonString = JSON.stringify(clients.value, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "clientes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      try {
        const importedClients = JSON.parse(content);
        clients.value = [...clients.value, ...importedClients];
        setTaskLocal();
      } catch (error) {
        alert("Erro ao importar o arquivo JSON: " + error.message);
      }
    };
    reader.readAsText(file);
  }
};

const importJson = () => {
  // Simula um clique no input file para abrir o seletor de arquivos
  if (fileInput.value) {
    fileInput.value.click();
  }
};

onMounted(() => {
  loadTaskLocal();
});
</script>

<style scoped>
/* Estilos do container principal */
.container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  padding: 2rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Seção de formulário */
.form-section {
  position: fixed;
  top: 2rem;
  left: 2rem;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

/* Estilo do título do formulário */
.form-section h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #007bff;
}

.p-field {
  margin-bottom: 1.5rem;
}

/* Seção de busca */
.search-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

/* Seção de cards */
.card-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 420px;
}

/* Estilos do card */
.cards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 2rem;
  flex: 1;
}

/* Grupo de botões */
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

/* Classes utilitárias */
.bold {
  font-weight: bold;
  font-size: 17px;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.datajson {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.delete-button:hover {
  color: #ff0000;
}

.card-item {
  position: relative;
}

/* Estilo do botão de deletar */
.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: #dc3545;
  font-size: 1.5rem;
}

.total {
  color: #007bff;
}

.total-pagamentos {
  margin-top: 1rem;
  font-weight: bold;
  font-size: 1.2rem;
  color: #007bff;
}

/* Responsividade */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .form-section {
    position: relative;
    max-width: 100%;
    width: auto;
    margin: 0px -30px 20px -30px;
  }

  .card-section {
    margin-left: 0;
    width: 100%;
  }

  .search-section {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }
  .datajson {
    justify-content: center;
  }
  .p-button {
    width: 100%;
  }

  .cards-list {
    grid-template-columns: 1fr;
  }
}
</style>
