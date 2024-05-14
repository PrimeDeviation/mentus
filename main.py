from flask import Flask, request, jsonify, render_template
from langchain_openai import ChatOpenAI
from langgraph.graph import END, MessageGraph
from langchain_core.messages import HumanMessage, AIMessage

app = Flask(__name__)

# Initialize LangChain and LangGraph
model = ChatOpenAI(temperature=0)
graph = MessageGraph()
graph.add_node("oracle", model)
graph.add_edge("oracle", END)
graph.set_entry_point("oracle")
runnable = graph.compile()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    # Process the message using LangChain and LangGraph
    response_messages = runnable.invoke(HumanMessage(user_message))
    response = response_messages[-1].content if isinstance(response_messages[-1], AIMessage) else "Error: No response from agent."
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
