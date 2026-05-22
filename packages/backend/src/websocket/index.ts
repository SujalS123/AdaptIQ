import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { env } from '../config/env';
import axios from 'axios';

export const initWebSocketServer = (server: Server): WebSocketServer => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, pathname);
    });
  });

  wss.on('connection', (ws: WebSocket, request: any, pathname: string) => {
    console.log(`🔌 WebSocket connection established on path: ${pathname}`);

    if (pathname.includes('/ws/nova')) {
      handleNovaSocket(ws);
    } else if (pathname.includes('/ws/teacher')) {
      handleTeacherSocket(ws);
    } else {
      // Default fallback messaging channel
      ws.on('message', (message: string) => {
        ws.send(JSON.stringify({ status: 'echo', data: message.toString() }));
      });
    }

    ws.on('close', () => {
      console.log(`🔌 WebSocket connection closed on path: ${pathname}`);
    });
  });

  return wss;
};

// Handle real-time Socratic feedback token streaming for NovaChat
const handleNovaSocket = (ws: WebSocket) => {
  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      const { text, studentId, selectedLanguage } = data;

      if (!text) {
        ws.send(JSON.stringify({ error: 'Text prompt is required' }));
        return;
      }

      // Socratic streaming connection to FastAPI AI engine
      ws.send(JSON.stringify({ type: 'start' }));

      // Synchronous wait generator simulating streamed chunks
      const sendToken = (token: string, delay: number) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            ws.send(JSON.stringify({ type: 'token', token }));
            resolve();
          }, delay);
        });
      };

      let reply = '';
      try {
        const response = await axios.post(`${env.AI_ENGINE_URL}/nova/chat`, {
          student_id: studentId || 'student_123',
          text: text,
          current_theta: 0.0,
          recent_errors: [],
          selected_language: selectedLanguage || 'en'
        }, { timeout: 15000 });
        
        reply = response.data.response;
        console.log(`[Nova WS] Successfully fetched Socratic response from AI Engine in language '${response.data.language_detected}'.`);
      } catch (aiErr: any) {
        console.warn(`[WARN] Failed to contact AI Engine: ${aiErr.message}. Dropping to localized local fallback.`);
        const lang = (selectedLanguage || 'en').toLowerCase();

        const fallbackDbms: Record<string, string> = {
          en: "A great question! In Professor Sharma's DBMS Slide 14, he describes Normalization as organizing data to reduce redundancy. Instead of giving you the formula, let me ask: what structural problems arise if we store a student's address repeatedly alongside every single quiz grade?",
          hi: "एक बहुत अच्छा सवाल! प्रोफेसर शर्मा के DBMS स्लाइड 14 में, वे नॉर्मलाइजेशन को डेटा में दोहराव (redundancy) कम करने के रूप में समझाते हैं। फॉर्मूला देने के बजाय, मैं आपसे पूछता हूँ: यदि हम हर क्विज़ ग्रेड के साथ छात्र का पता बार-बार संग्रहीत करते हैं, तो क्या संरचनात्मक समस्याएं उत्पन्न होंगी?",
          mr: "खूप छान प्रश्न! प्राध्यापक शर्मा यांच्या DBMS स्लाईड १४ मध्ये, ते नॉर्मलायझेशन म्हणजे डेटाबेसमधील डुप्लिकेशन कमी करणे असे स्पष्ट करतात. फॉर्म्युला देण्याऐवजी, मी तुम्हाला विचारतो: जर आपण प्रत्येक क्विझ ग्रेडसोबत विद्यार्थ्याचा पत्ता वारंवार साठवून ठेवला, तर कोणत्या समस्या निर्माण होतील?",
          bn: "খুব ভালো প্রশ্ন! প্রফেসর শর্মার DBMS স্লাইড ১৪-এ, তিনি নরমালাইজেশনকে ডেটার পুনরাবৃত্তি কমানো হিসেবে বর্ণনা করেছেন। ফর্মুলা দেওয়ার বদলে, আমি আপনাকে জিজ্ঞাসা করি: যদি আমরা প্রতিটি কুইজ গ্রেডের সাথে শিক্ষার্থীর ঠিকানা বারবার সংরক্ষণ করি, তবে কী ধরণের কাঠামোগত সমস্যা হবে?",
          ta: "ஒரு சிறந்த கேள்வி! பேராசிரியர் சர்மாவின் டிபிஎம்எஸ் ஸ்லைடு 14-ல், அவர் நார்மலைசேஷனை மீண்டும் மீண்டும் வருவதைக் குறைப்பதாக விளக்குகிறார். சூத்திரத்தைக் கூறுவதற்குப் பதிலாக, நான் கேட்கிறேன்: ஒவ்வொரு வினாடி வினா மதிப்பெண்ணுடனும் ஒரு மாணவரின் முகவரியை மீண்டும் மீண்டும் சேமித்தால் என்ன பிரச்சனைகள் ஏற்படும்?",
          te: "చాలా మంచి ప్రశ్న! ప్రొఫెసర్ శర్మ గారి DBMS స్లైడ్ 14 లో, నార్మలైజేషన్ అంటే డేటాలో పునరావృతాన్ని తగ్గించడమని వివరించారు. ఫార్ములా చెప్పే బదులు, మిమ్మల్ని అడుగుతున్నాను: ప్రతి క్విజ్ గ్రేడ్‌తో పాటు విద్యార్థి చిరునామాను పదేపదే నిల్వ చేస్తే ఎలాంటి నిర్మాణాత్మక సమస్యలు వస్తాయి?"
        };

        const fallbackCricket: Record<string, string> = {
          en: "Ah! Since you mentioned cricket, database normalization is like organizing a kit bag. Instead of dumping widgets, pads, and balls together, we segregate them into specific compartments. What kinds of compartments should we build for bowlers vs batsmen?",
          hi: "अहा! चूंकि आपने क्रिकेट का उल्लेख किया है, डेटाबेस सामान्यीकरण क्रिकेट किट बैग को व्यवस्थित करने जैसा है। सभी चीज़ों को एक साथ रखने के बजाय, हम उन्हें अलग-अलग रखते हैं। आपके अनुसार गेंदबाजों और बल्लेबाजों के लिए हमें क्या अलग कम्पार्टमेंट बनाने चाहिए?",
          mr: "नक्कीच! डेटाबेस नॉर्मलायझेशन म्हणजे क्रिकेट किट बॅग व्यवस्थित ठेवण्यासारखे आहे. सर्व सामान एकत्र ठेवण्याऐवजी आपण ते वेगवेगळ्या कप्प्यांमध्ये ठेवतो. गोलंदाज आणि फलंदाजांसाठी कोणते वेगवेगळे कप्पे असावेत?",
          bn: "একেবারে! ডেটাবেস নরমালাইজেশন হলো ক্রিকেট কিট ব্যাগ গুছিয়ে রাখার মতো। সব জিনিস একসাথে রাখার চেয়ে আলাদা আলাদা রাখা ভালো। বোলার এবং ব্যাটসম্যানদের জন্য কী কী আলাদা কম্পার্টমেন্ট থাকা উচিত?",
          ta: "நிச்சயமாக! தரவுத்தள நார்மலைசேஷன் என்பது கிரிக்கெட் கிட் பையை ஒழுங்கமைப்பது போன்றது. பேட், பந்து மற்றும் பிற உபகரணங்களை தனித்தனி அறைகளில் வைப்பது போல. பந்துவீச்சாளர்கள் மற்றும் பேட்ஸ்மேன்களுக்கு என்னென்ன தனி அறைகளை உருவாக்க வேண்டும்?",
          te: "ఖచ్చితంగా! డేటాబేస్ నార్మలైజేషన్ అనేది క్రికెట్ కిట్ బ్యాగ్‌ను సర్దడం లాంటిది. అన్ని వస్తువులను ఒకే చోట కాకుండా వేర్వేరు కంపార్ట్‌మెంట్‌లలో ఉంచడం. బౌలర్లు మరియు బ్యాట్స్‌మెన్ కోసం ఎలాంటి వేర్వేరు కంపార్ట్‌మెంట్‌లు ఉండాలి?"
        };

        const fallbackDefault: Record<string, string> = {
          en: "I hear you! To connect this to your GATE prep: how does this concept relate to functional dependencies, or should we review Professor Sharma's class slides first?",
          hi: "यह एक दिलचस्प बिंदु है! इसे आपके सिलेबस से जोड़ते हुए: आपको क्या लगता है कि यह कार्यात्मक निर्भरता (functional dependencies) से कैसे संबंधित है, या हमें पहले क्लास स्लाइड्स को देखना चाहिए?",
          mr: "हा एक मनोरंजक मुद्दा आहे! तुमच्या अभ्यासक्रमाशी जोडताना: तुम्हाला काय वाटते की हे फंक्शनल डिपेंडेंसीशी (functional dependencies) कसे संबंधित आहे, की आपण आधी क्लास स्लाईड्स पाहायच्या?",
          bn: "এটি একটি আকর্ষণীয় পয়েন্ট! আপনার সিলেবাসের সাথে সম্পর্কিত করে: এটি ফাংশনাল ডিপেন্ডেন্সির (functional dependencies) সাথে কীভাবে সম্পর্কিত বলে আপনি মনে করেন, নাকি আগে ক্লাস স্লাইডগুলো দেখব?",
          ta: "இது ஒரு சுவாரஸ்யமான புள்ளி! உங்கள் பாடத்திட்டளுடன் ஒப்பிடுகையில்: இது ஃபங்க்ஷனல் டிபென்டென்சியுடன் (functional dependencies) எவ்வாறு தொடர்புடையது என்று நினைக்கிறீர்கள், அல்லது முதலில் வகுப்பு ஸ்லைடுகளை பார்க்கலாமா?",
          te: "ఇది ఒక ఆసక్తికరమైన అంశం! మీ సిలబస్‌తో అనుసంధానిస్తే: ఇది ఫంక్షనల్ డిపెండెన్సీలతో (functional dependencies) ఎలా సంబంధం కలిగి ఉందని మీరు భావిస్తున్నారు, లేదా మొదట క్లాస్ స్లైడ్స్ చూద్దామా?"
        };

        const textLower = text.toLowerCase();
        if (textLower.includes('normal') || textLower.includes('database') || textLower.includes('नॉर्मला') || textLower.includes('सामान्यीकरण') || textLower.includes('নরমালাই') || textLower.includes('நார்மலை') || textLower.includes('నార్మలై')) {
          reply = fallbackDbms[lang] || fallbackDbms['en'];
        } else if (textLower.includes('cricket') || textLower.includes('क्रिकेट') || textLower.includes('கிரிக்கெட்') || textLower.includes('క్రికెట్')) {
          reply = fallbackCricket[lang] || fallbackCricket['en'];
        } else {
          reply = fallbackDefault[lang] || fallbackDefault['en'];
        }
      }

      // Stream the response word by word (split by spaces) to show high-premium fluid micro-interactions
      const tokens = reply.split(' ');
      for (const token of tokens) {
        await sendToken(token + ' ', 50);
      }

      ws.send(JSON.stringify({ type: 'end' }));
    } catch (err: any) {
      ws.send(JSON.stringify({ error: 'Failed to process socket message: ' + err.message }));
    }
  });
};

// Handle real-time alert broadcasts for teachers
const handleTeacherSocket = (ws: WebSocket) => {
  // Push a welcome message or alerts
  ws.send(JSON.stringify({
    type: 'alert_feed',
    alerts: [
      { id: 'a1', studentName: 'Priya Sharma', riskLevel: 'low', message: 'Priya has completed the normalization quiz with advanced ability +1.45 θ!', timestamp: new Date() }
    ]
  }));

  ws.on('message', (message: string) => {
    console.log('[Teacher WS] Message received:', message.toString());
  });
};
