$(document).ready(function(){
    document.getElementById('messageInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            console.log('enter');
            e.preventDefault();
            sendMessage();
        }
    });
});

let socket = null;

function startChat() {
    const userId = document.getElementById('userId').value.trim();
    if (userId) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('chatSection').style.display = 'flex';
        document.getElementById('userDisplay').style.display = 'block';
        document.getElementById('username').textContent = userId;

        // 서버 연결
        connectServer(userId);

        addSystemMessage('채팅방에 입장하였습니다.');
    }
}

function connectServer(userId){
    socket = new WebSocket('ws://3.37.193.134:8080/ws/chat');
    // ip 변경

    socket.onopen = () => {
        console.log('서버와 연결됨');
        const initMsg = { type: 'init', userId: userId};
        socket.send(JSON.stringify(initMsg));
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        var systemMsg = "";
        switch (data.type){
            case 'systemLeave':
                systemMsg = data.userId + "님이 채팅방을 나갔습니다.";
                addSystemMessage(systemMsg);
                break;
            case 'systemEnter':
                systemMsg = data.userId + "님이 채팅방에 입장했습니다.";
                addSystemMessage(systemMsg);
                break;
            default:
                addMessage(data);
                break;
        }
    }

    socket.onclose = () => {
        console.log('서버와의 연결이 닫혔습니다.');
        //location.reload();
    };

    socket.onerror = (error) => {
        console.error('WebSocket 에러 발생:', error);
        //location.reload();
    };
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (message) {
        const username = document.getElementById('username').textContent;
        input.value = '';
        const msgToSend = {
            type: 'chat',
            room: 'default',
            userId: username,
            text: message,
        }
        socket.send(JSON.stringify(msgToSend));
    }
}

function addMessage(data) {
    const userId = document.getElementById('userId').value.trim();

    const sender = data.userId;
    const isSelf = sender === userId;
    const text = data.text;

    const timeVal = new Date(data.createAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    console.log(data.createAt);
    const messageList = document.getElementById('messageList');
    const messageDiv = document.createElement('div');

    messageDiv.className = `flex ${isSelf ? 'justify-end' : 'justify-start'}`;
    messageDiv.innerHTML = `
                <div class="${isSelf ? 'bg-custom text-white' : 'bg-gray-100 text-gray-800'} rounded-lg px-4 py-2 max-w-[70%]">
                <div class="text-sm font-medium mb-1">${sender}</div>
                <div>${text}</div>
                <div class="text-xs ${isSelf ? 'text-white/80' : 'text-gray-500'} text-right mt-1">${timeVal}</div>
                </div>  
            `;
    messageList.appendChild(messageDiv);
    messageList.scrollTop = messageList.scrollHeight;
}


function addSystemMessage(text) {
    const messageList = document.getElementById('messageList');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex justify-center';

    messageDiv.innerHTML = `
                <div class="bg-gray-200 text-gray-600 rounded-full px-4 py-1 text-sm">
                    ${text}
                </div>
            `;

    messageList.appendChild(messageDiv);
    messageList.scrollTop = messageList.scrollHeight;
}

