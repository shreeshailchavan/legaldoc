import streamlit as st
import os
import time
from langchain_community.llms import LlamaCpp
from langchain_community.embeddings import LlamaCppEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
import tempfile

# Model paths - update these to your model locations
LLM_MODEL_PATH = r"C:\Users\yuvra\OneDrive\Desktop\Docufy\mistral-7b-instruct-v0.2.Q4_K_M.gguf"
EMBEDDING_MODEL_PATH = r"C:\Users\yuvra\OneDrive\Desktop\Docufy\mistral-7b-instruct-v0.2.Q4_K_M.gguf"  # Same model for both tasks

# Improved prompt template for RAG
prompt = ChatPromptTemplate.from_template(
    """
    <context>
    {context}
    </context>

    You are a helpful research assistant analyzing PDF documents. Answer the user's question based ONLY on the information provided in the context above.
    
    Guidelines:
    - If the answer is clearly in the context, provide a detailed response
    - If the answer is partially in the context, provide what information you can find
    - If the answer is not in the context, respond with: "I don't have enough information in the documents to answer that question."
    - Do not use any knowledge outside of the provided context
    - Cite specific parts of the text when possible
    - Keep your answers factual and directly tied to the document content
    
    User question: {input}
    """
)

# Initialize LLM and embedding models
@st.cache_resource
def load_llm():
    return LlamaCpp(
        model_path=LLM_MODEL_PATH,
        temperature=0.1,
        max_tokens=2000,
        n_ctx=4096,
        n_batch=512,  # Adjust based on your GPU/CPU capabilities
        verbose=False,
    )

@st.cache_resource
def load_embeddings():
    return LlamaCppEmbeddings(
        model_path=EMBEDDING_MODEL_PATH,
        n_ctx=2048,
        n_batch=8,
        verbose=False
    )

# Function to process uploaded files and create vector embeddings
def create_vector_embedding(uploaded_files):
    with st.spinner("Processing uploaded files and creating embeddings..."):
        documents = []
        
        # Process each uploaded file
        for uploaded_file in uploaded_files:
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                tmp_file.write(uploaded_file.getbuffer())
                tmp_path = tmp_file.name
            
            # Load and process the PDF
            try:
                loader = PyPDFLoader(tmp_path)
                docs = loader.load()
                if docs:
                    documents.extend(docs)
                    st.session_state.file_details.append(f"✅ {uploaded_file.name}: {len(docs)} pages")
                else:
                    st.session_state.file_details.append(f"⚠️ {uploaded_file.name}: No content extracted")
            except Exception as e:
                st.session_state.file_details.append(f"❌ {uploaded_file.name}: Error - {str(e)}")
            
            # Clean up temporary file
            os.unlink(tmp_path)
        
        if not documents:
            st.error("No valid content found in the uploaded files.")
            return False
        
        # Split documents and create vector store
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        
        split_documents = text_splitter.split_documents(documents)
        
        if not split_documents:
            st.error("Failed to split documents into usable chunks.")
            return False
        
        st.session_state.file_details.append(f"📄 Total chunks created: {len(split_documents)}")
        
        # Create embeddings and vector store
        embeddings = load_embeddings()
        st.session_state.vectors = FAISS.from_documents(split_documents, embeddings)
        st.session_state.docs = documents  # Store raw docs for status
        
        return True

# Page configuration and title
st.set_page_config(page_title="PDF Research Assistant", layout="wide")
st.title("📚 PDF Research Assistant")
st.subheader("Upload PDFs and ask questions about your documents")

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "file_details" not in st.session_state:
    st.session_state.file_details = []

# Create a two-column layout
col1, col2 = st.columns([2, 1])

with col1:
    # File uploader
    uploaded_files = st.file_uploader(
        "Upload PDF files (max 200MB total)", 
        type=["pdf"], 
        accept_multiple_files=True
    )
    
    # Process uploaded files when submitted
    if uploaded_files and "vectors" not in st.session_state:
        if create_vector_embedding(uploaded_files):
            st.success("✅ Vector database created successfully!")
    
    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Chat input
    if "vectors" in st.session_state:
        if user_prompt := st.chat_input("What would you like to know from the uploaded documents?"):
            # Add user message to chat history
            st.session_state.messages.append({"role": "user", "content": user_prompt})
            with st.chat_message("user"):
                st.markdown(user_prompt)
            
            # Process the query
            with st.chat_message("assistant"):
                with st.spinner("Analyzing documents..."):
                    llm = load_llm()
                    document_chain = create_stuff_documents_chain(llm, prompt)
                    retriever = st.session_state.vectors.as_retriever(
                        search_kwargs={"k": 4}  # Retrieve top 4 most relevant chunks
                    )
                    retrieval_chain = create_retrieval_chain(retriever, document_chain)
                    
                    start = time.process_time()
                    response = retrieval_chain.invoke({'input': user_prompt})
                    response_time = time.process_time() - start
                    
                    # Display the answer
                    st.markdown(response['answer'])
                    st.session_state.messages.append({"role": "assistant", "content": response['answer']})
                    
                    # Add response time and similarity search in an expander
                    with st.expander(f"📝 Source Documents (Response time: {response_time:.2f}s)"):
                        st.write("Relevant document chunks:")
                        for i, doc in enumerate(response['context']):
                            st.write(f"**Chunk {i+1}:**")
                            st.write(doc.page_content)
                            st.write("Source:", doc.metadata.get('source', 'Unknown'))
                            st.write('------------------------')
    else:
        st.info("👆 Please upload at least one PDF file to start chatting.")

with col2:
    st.subheader("📊 System Status")
    
    # Show model information
    st.write("**Model Information:**")
    st.write(f"- LLM: {os.path.basename(LLM_MODEL_PATH)}")
    
    # Document stats
    st.write("**Document Status:**")
    if 'docs' in st.session_state:
        st.write(f"- Documents loaded: {len(st.session_state.docs)}")
        st.write(f"- Vector store: ✅ Ready")
    else:
        st.write("- Documents loaded: 0")
        st.write("- Vector store: ❌ Not initialized")
    
    # File processing details
    if st.session_state.file_details:
        st.write("**File Processing Details:**")
        for detail in st.session_state.file_details:
            st.write(detail)
    
    # Add a button to clear chat history and reset
    if st.button("🔄 Clear Chat and Reset"):
        st.session_state.clear()
        st.rerun()