let db = null;
let SQL = null;

// 1. Função procedural para inicializar o banco de dados no navegador
async function initDatabase() {
    try {
        // Carrega o WebAssembly do SQL.js
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        // Verifica se já existe um banco salvo no LocalStorage do aluno
        const savedDb = localStorage.getItem('meu_banco_sql');
       
        if (savedDb) {
            // Se existir, restaura os dados salvos anteriormente
            const uInt8Array = new Uint8Array(JSON.parse(`[${savedDb}]`));
            db = new SQL.Database(uInt8Array);
            mostrarMensagem("Banco de dados carregado com sucesso do LocalStorage!", "success");
        } else {
            // Se for a primeira vez, cria o banco do zero e insere dados de exemplo
            db = new SQL.Database();
            db.run(`
                CREATE TABLE alunos (id INTEGER PRIMARY KEY, nome TEXT, idade INTEGER, curso TEXT);
                INSERT INTO alunos (id, nome, idade, curso) VALUES (1, 'Carlos Silva', 22, 'Sistemas');
                INSERT INTO alunos (id, nome, idade, curso) VALUES (2, 'Mariana Souza', 25, 'Administração');
                INSERT INTO alunos (id, nome, idade, curso) VALUES (3, 'João Pedro', 20, 'Engenharia');
            `);
            salvarNoLocalStorage();
            mostrarMensagem("Banco de dados inicializado com dados de exemplo!", "success");
        }
    } catch (err) {
        mostrarMensagem(`Erro ao carregar o motor SQL: ${err.message}`, "error");
    }
}

// 2. Função para persistir o estado atual do banco no navegador
function salvarNoLocalStorage() {
    if (db) {
        const binaryArray = db.export();
        localStorage.setItem('meu_banco_sql', JSON.stringify(Array.from(binaryArray)));
    }
}

// 3. Função principal acionada pelo clique do botão no HTML
function executarSQL() {
    if (!db) {
        alert("O banco de dados ainda está carregando. Aguarde um instante.");
        return;
    }

    const sqlQuery = document.getElementById('queryInput').value;
    const container = document.getElementById('resultadoContainer');
   
    // Limpa os resultados anteriores
    container.innerHTML = '';
    mostrarMensagem('', '');

    try {
        // Executa a query usando o SQL.js
        const results = db.exec(sqlQuery);
       
        if (results.length === 0) {
            mostrarMensagem("Comando executado com sucesso! (Nenhum dado retornado para exibição)", "success");
            salvarNoLocalStorage();
            return;
        }

        // Se houver retorno (ex: SELECT), monta a tabela HTML dinamicamente (DOM)
        results.forEach(res => {
            const table = document.createElement('table');
           
            // Cria o cabeçalho da tabela
            const trHead = document.createElement('tr');
            res.columns.forEach(col => {
                const th = document.createElement('th');
                th.innerText = col;
                trHead.appendChild(th);
            });
            table.appendChild(trHead);

            // Preenche as linhas da tabela
            res.values.forEach(row => {
                const tr = document.createElement('tr');
                row.forEach(val => {
                    const td = document.createElement('td');
                    td.innerText = val !== null ? val : 'NULL';
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });

            container.appendChild(table);
        });

        // Salva alterações (INSERT, UPDATE, DELETE) no LocalStorage automaticamente
        salvarNoLocalStorage();
        mostrarMensagem("Consulta executada com sucesso!", "success");

    } catch (err) {
        mostrarMensagem(`Erro SQL: ${err.message}`, "error");
    }
}

// 4. Função auxiliar procedural para exibir mensagens na tela
function mostrarMensagem(texto, tipo) {
    const msgDiv = document.getElementById('mensagem');
    msgDiv.innerText = texto;
    msgDiv.className = tipo;
}

// Inicializa a aplicação assim que o script é carregado
initDatabase();
