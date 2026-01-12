export const translations = {
  en: {
    // Header
    appTitle: 'Government Voice Agent',
    poweredBy: 'Powered by MACbook',
    
    // Sidebar
    dashboardHome: 'Dashboard Home',
    callLogs: 'Call Logs',
    inboundLogs: 'Inbound Logs',
    outboundCalls: 'Outbound Calls',
    queries: 'Queries',
    govContactInfo: 'Govt Contact Info',
    
    // Dashboard
    dashboardOverview: 'Dashboard Overview',
    refreshLogs: 'Refresh logs',
    totalCalls: 'Total Calls',
    last24Hours: 'Last 24 Hours',
    inbound: 'Inbound',
    outbound: 'Outbound',
    recentCalls: 'Recent Calls',
    inboundCalls: 'Inbound Calls',
    outboundCallsCount: 'Outbound Calls',
    dashboardGuide: 'Dashboard Guide',
    welcomeMessage: 'Welcome to the AI Sathi Government Voice Agent Dashboard. This system enables seamless communication between citizens and government services through AI-powered voice conversations.',
    mainFeatures: 'Main Features:',
    dashboardHomeDesc: 'Overview of all call statistics and recent activity',
    inboundLogsDesc: 'Monitor calls initiated by citizens calling the government helpline',
    outboundCallsDesc: 'Initiate calls to reach citizens with announcements and information',
    queriesDocsDesc: 'Log and sync citizen queries to Google Docs for government records',
    govContactInfoDesc: 'Display contact information and service details',
    
    // Call Logs
    callLogsTitle: 'Call Logs',
    downloadCsv: 'Download CSV',
    downloadingLogs: 'Downloading logs...',
    downloadSuccess: 'Logs downloaded successfully!',
    downloadError: 'Failed to download logs',
    allCalls: 'All Calls',
    callRecords: 'Call Records',
    loadingCalls: 'Loading calls...',
    noCallsFound: 'No calls found',
    noCallsMsg: 'Calls will appear here as they are logged',
    callTime: 'Call Time',
    direction: 'Direction',
    from: 'From',
    to: 'To',
    callSid: 'Call SID',
    lastMessage: 'Last Message',
    noMessage: 'No message',
    
    // Inbound Calls
    inboundCallsTitle: 'Inbound Calls',
    inboundCallsMonitor: 'Inbound Calls Monitor',
    aboutInboundCalls: 'About Inbound Calls',
    downloadLogs: 'Download Logs',
    inboundCallsDescription: 'Incoming calls are received through the voice API. When a call is made to your configured phone number, it is logged here.',
    inboundCallsStatus: 'Call Status',
    inboundLogsTitle: 'Inbound Call Logs',
    
    // Outbound Calls
    outboundCallsTitle: 'Outbound Calls',
    outboundCallsMonitor: 'Outbound Calls Monitor',
    aboutOutboundCalls: 'About Outbound Calls',
    makeCall: 'Make a Call',
    enterPhoneNumber: 'Enter Phone Number',
    enterCustomMessage: 'Enter Custom Message',
    webhookUrl: 'Webhook URL',
    initiatingCalls: 'Initiating calls...',
    callsInitiated: 'Calls initiated successfully!',
    pleaseEnterPhoneNumber: 'Please enter at least one phone number',
    pleaseProvideWebhookUrl: 'Please provide a webhook URL',
    makeCallButton: 'Make Call',
    initiateCall: 'Initiate Call',
    
    // Queries
    officialQueryRegistry: 'Official Query Registry',
    makeQuery: 'Make a Query',
    enterYourQuery: 'Enter your query...',
    submitQueryButton: 'Submit Query',
    syncing: 'Syncing...',
    querySent: 'Query sent successfully!',
    enterQueryBefore: 'Please enter a query before submitting.',
    queryError: 'Cannot connect to backend server',
    
    // Contact Info
    governmentContactInfo: 'Government Contact Information',
    getInTouch: 'Get in touch with Government of India services and support',
    organization: 'Organization',
    organizationValue: 'Government of India',
    department: 'Department',
    departmentValue: 'Digital Services Division',
    address: 'Address',
    addressValue: 'North Block, Raisina Hill, New Delhi - 110011',
    phone: 'Phone',
    phoneValue: '+91-11-23012345',
    email: 'Email',
    emailValue: 'support@india.gov.in',
    website: 'Website',
    websiteValue: 'https://www.india.gov.in',
    workingHours: 'Working Hours',
    workingHoursValue: 'Monday to Friday: 9:00 AM - 6:00 PM IST',
    emergency: 'Emergency',
    emergencyValue: '+91-11-23012346',
    
    // Inbound Calls - Additional content
    inboundCallsIntro: 'Inbound calls are calls initiated by citizens calling the government AI voice agent system. These calls are automatically routed to our AI assistant which helps citizens with government schemes, services, and information in both Hindi and English.',
    howItWorks: 'How It Works:',
    howItWorksSteps: [
      'Citizen calls the government helpline number',
      'System asks caller to select language (Hindi=1, English=2)',
      'AI assistant provides personalized guidance',
      'Conversation is recorded and logged automatically',
      'Data is stored for government records and analysis'
    ],
    keyFeatures: 'Key Features:',
    keyFeaturesList: [
      '24/7 availability - citizens can call anytime',
      'Bilingual support (Hindi & English)',
      'Real-time AI responses using Groq LLaMA 3.3',
      'Complete transcripts for record keeping',
      'Automatic government scheme information'
    ],
    callInformationCaptured: 'Call Information Captured:',
    callInformationList: [
      'Call timestamp and duration',
      'Caller phone number (From)',
      'Government number called (To)',
      'Complete transcript of conversation',
      'Call SID for reference'
    ],
    totalInboundCalls: 'Total Inbound Calls',
    recentCallsLast5: 'Recent Calls (Last 5)',
    
    // Outbound Calls - Additional content
    outboundCallsIntro: 'Outbound calls are calls made by the government system to citizens. These calls are used to disseminate important information, alerts, and notices.',
    selectNumbers: 'Select multiple phone numbers and initiate bulk calls with a message.',
    addPhoneNumber: 'Add Phone Number',
    addNumber: 'Add',
    removeNumber: 'Remove',
    customCallMessage: 'Custom Call Message (optional)',
    initiateCallsNow: 'Initiate Calls Now',
    noNumbersAdded: 'No phone numbers added. Add at least one number to make calls.',
    
    // Queries - Additional content
    queryRegistry: 'Official Query Registry',
    submitQueryForGov: 'Submit your query to the government system. Your query will be processed by our AI agent.',
    queryPlaceholder: 'Enter your query or feedback here...',
    
    // Common UI elements
    refresh: 'Refresh',
    close: 'Close',
    submit: 'Submit',
    cancel: 'Cancel',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    failed: 'Failed',
    
    // Contact Info - Additional fields
    aboutThisService: 'About This Service',
    aboutThisServiceDesc: 'This AI-powered voice calling service is designed to assist citizens with government-related queries and information. Our system supports both Hindi and English languages and is available 24/7 for your convenience. All calls are logged and documented for record-keeping purposes.',
    technicalSupport: 'Technical Support',
    technicalSupportDesc: 'For technical issues or assistance with the calling service, please contact our support team at support@india.gov.in or call during business hours.',
    saturdaySundayClosed: 'Saturday & Sunday: Closed',
  },
  hi: {
    // Header
    appTitle: 'सरकारी वॉयस एजेंट',
    poweredBy: 'MACbook द्वारा संचालित',
    
    // Sidebar
    dashboardHome: 'डैशबोर्ड होम',
    callLogs: 'कॉल लॉग्स',
    inboundLogs: 'इनकमिंग कॉल्स',
    outboundCalls: 'आउटगोइंग कॉल्स',
    queries: 'प्रश्न',
    govContactInfo: 'सरकारी संपर्क जानकारी',
    
    // Dashboard
    dashboardOverview: 'डैशबोर्ड अवलोकन',
    refreshLogs: 'लॉग्स रीफ्रेश करें',
    totalCalls: 'कुल कॉल्स',
    last24Hours: 'पिछले 24 घंटे',
    inbound: 'इनकमिंग',
    outbound: 'आउटगोइंग',
    recentCalls: 'हाल की कॉल्स',
    inboundCalls: 'इनकमिंग कॉल्स',
    outboundCallsCount: 'आउटगोइंग कॉल्स',
    dashboardGuide: 'डैशबोर्ड गाइड',
    welcomeMessage: 'AI साथी सरकारी वॉयस एजेंट डैशबोर्ड में आपका स्वागत है। यह प्रणाली नागरिकों और सरकारी सेवाओं के बीच AI-संचालित वॉयस वार्तालापों के माध्यम से सुचारू संचार सक्षम करती है।',
    mainFeatures: 'मुख्य विशेषताएं:',
    dashboardHomeDesc: 'सभी कॉल सांख्यिकी और हाल की गतिविधि का अवलोकन',
    inboundLogsDesc: 'सरकारी हेल्पलाइन पर कॉल करने वाले नागरिकों द्वारा शुरू की गई कॉल्स की निगरानी करें',
    outboundCallsDesc: 'घोषणाओं और जानकारी के साथ नागरिकों तक पहुंचने के लिए कॉल्स शुरू करें',
    queriesDocsDesc: 'सरकारी रिकॉर्ड के लिए नागरिक प्रश्नों को Google डॉक्स में लॉग और सिंक करें',
    govContactInfoDesc: 'संपर्क जानकारी और सेवा विवरण प्रदर्शित करें',
    
    // Call Logs
    callLogsTitle: 'कॉल लॉग्स',
    downloadCsv: 'CSV डाउनलोड करें',
    downloadingLogs: 'लॉग्स डाउनलोड हो रहे हैं...',
    downloadSuccess: 'लॉग्स सफलतापूर्वक डाउनलोड हुए!',
    downloadError: 'लॉग्स डाउनलोड करने में विफल',
    allCalls: 'सभी कॉल्स',
    callRecords: 'कॉल रिकॉर्ड्स',
    loadingCalls: 'कॉल्स लोड हो रहे हैं...',
    noCallsFound: 'कोई कॉल नहीं मिली',
    noCallsMsg: 'कॉल्स यहाँ दिखाई देंगी क्योंकि वे लॉग होती हैं',
    callTime: 'कॉल का समय',
    direction: 'दिशा',
    from: 'से',
    to: 'को',
    callSid: 'कॉल SID',
    lastMessage: 'आखिरी संदेश',
    noMessage: 'कोई संदेश नहीं',
    
    // Inbound Calls
    inboundCallsTitle: 'इनकमिंग कॉल्स',
    inboundCallsMonitor: 'इनकमिंग कॉल्स मॉनिटर',
    aboutInboundCalls: 'इनकमिंग कॉल्स के बारे में',
    downloadLogs: 'लॉग्स डाउनलोड करें',
    inboundCallsDescription: 'वॉयस API के माध्यम से इनकमिंग कॉल्स प्राप्त होती हैं। जब आपके कॉन्फ़िगर किए गए फोन नंबर पर कॉल की जाती है, तो इसे यहाँ लॉग किया जाता है।',
    inboundCallsStatus: 'कॉल स्थिति',
    inboundLogsTitle: 'इनकमिंग कॉल लॉग्स',
    
    // Outbound Calls
    outboundCallsTitle: 'आउटगोइंग कॉल्स',
    outboundCallsMonitor: 'आउटगोइंग कॉल्स मॉनिटर',
    aboutOutboundCalls: 'आउटगोइंग कॉल्स के बारे में',
    makeCall: 'कॉल करें',
    enterPhoneNumber: 'फोन नंबर दर्ज करें',
    enterCustomMessage: 'कस्टम संदेश दर्ज करें',
    webhookUrl: 'वेबहुक URL',
    initiatingCalls: 'कॉल्स शुरू हो रहे हैं...',
    callsInitiated: 'कॉल्स सफलतापूर्वक शुरू किए गए!',
    pleaseEnterPhoneNumber: 'कृपया कम से कम एक फोन नंबर दर्ज करें',
    pleaseProvideWebhookUrl: 'कृपया एक वेबहुक URL प्रदान करें',
    makeCallButton: 'कॉल करें',
    initiateCall: 'कॉल शुरू करें',
    
    // Queries
    officialQueryRegistry: 'आधिकारिक प्रश्न पंजीकरण',
    makeQuery: 'प्रश्न सबमिट करें',
    enterYourQuery: 'अपना प्रश्न दर्ज करें...',
    submitQueryButton: 'प्रश्न सबमिट करें',
    syncing: 'सिंक हो रहा है...',
    querySent: 'प्रश्न सफलतापूर्वक भेजा गया!',
    enterQueryBefore: 'कृपया सबमिट करने से पहले एक प्रश्न दर्ज करें।',
    queryError: 'बैकएंड सर्वर से कनेक्ट नहीं हो सकते',
    
    // Contact Info
    governmentContactInfo: 'सरकारी संपर्क जानकारी',
    getInTouch: 'भारत सरकार की सेवाओं और समर्थन से संपर्क में रहें',
    organization: 'संगठन',
    organizationValue: 'भारत सरकार',
    department: 'विभाग',
    departmentValue: 'डिजिटल सेवा विभाग',
    address: 'पता',
    addressValue: 'नॉर्थ ब्लॉक, राईसीना हिल, नई दिल्ली - 110011',
    phone: 'फोन',
    phoneValue: '+91-11-23012345',
    email: 'ईमेल',
    emailValue: 'support@india.gov.in',
    website: 'वेबसाइट',
    websiteValue: 'https://www.india.gov.in',
    workingHours: 'कार्य समय',
    workingHoursValue: 'सोमवार से शुक्रवार: 9:00 AM - 6:00 PM IST',
    emergency: 'आपातकाल',
    emergencyValue: '+91-11-23012346',
    
    // Inbound Calls - Additional content
    inboundCallsIntro: 'इनकमिंग कॉल्स नागरिकों द्वारा सरकारी AI वॉयस एजेंट सिस्टम को कॉल करके शुरू की गई कॉल्स हैं। ये कॉल्स स्वचालित रूप से हमारे AI सहायक को रूट की जाती हैं जो नागरिकों को सरकारी योजनाओं, सेवाओं और जानकारी के साथ हिंदी और अंग्रेजी दोनों में मदद करता है।',
    howItWorks: 'यह कैसे काम करता है:',
    howItWorksSteps: [
      'नागरिक सरकारी हेल्पलाइन नंबर पर कॉल करता है',
      'सिस्टम कॉलर को भाषा चुनने के लिए कहता है (हिंदी=1, अंग्रेजी=2)',
      'AI सहायक व्यक्तिगत मार्गदर्शन प्रदान करता है',
      'बातचीत स्वचालित रूप से रिकॉर्ड और लॉग की जाती है',
      'डेटा सरकारी रिकॉर्ड और विश्लेषण के लिए संग्रहीत होता है'
    ],
    keyFeatures: 'मुख्य विशेषताएं:',
    keyFeaturesList: [
      '24/7 उपलब्धता - नागरिक कभी भी कॉल कर सकते हैं',
      'द्विभाषी समर्थन (हिंदी और अंग्रेजी)',
      'Groq LLaMA 3.3 का उपयोग करके वास्तविक समय AI प्रतिक्रियाएं',
      'रिकॉर्ड रखने के लिए पूर्ण प्रतिलेख',
      'स्वचालित सरकारी योजना जानकारी'
    ],
    callInformationCaptured: 'कॉल जानकारी कैप्चर की गई:',
    callInformationList: [
      'कॉल टाइमस्टैम्प और अवधि',
      'कॉलर फोन नंबर (से)',
      'सरकारी नंबर कॉल किया गया (को)',
      'बातचीत का पूर्ण प्रतिलेख',
      'संदर्भ के लिए कॉल SID'
    ],
    totalInboundCalls: 'कुल इनकमिंग कॉल्स',
    recentCallsLast5: 'हाल की कॉल्स (अंतिम 5)',
    
    // Outbound Calls - Additional content
    outboundCallsIntro: 'आउटगोइंग कॉल्स सरकारी प्रणाली द्वारा नागरिकों को की जाने वाली कॉल्स हैं। ये कॉल्स महत्वपूर्ण जानकारी, सतर्कताएं और सूचनाएं प्रसारित करने के लिए उपयोग की जाती हैं।',
    selectNumbers: 'कई फोन नंबर चुनें और एक संदेश के साथ बल्क कॉल्स शुरू करें।',
    addPhoneNumber: 'फोन नंबर जोड़ें',
    addNumber: 'जोड़ें',
    removeNumber: 'हटाएँ',
    customCallMessage: 'कस्टम कॉल संदेश (वैकल्पिक)',
    initiateCallsNow: 'अब कॉल्स शुरू करें',
    noNumbersAdded: 'कोई फोन नंबर नहीं जोड़ा गया। कॉल्स करने के लिए कम से कम एक नंबर जोड़ें।',
    
    // Queries - Additional content
    queryRegistry: 'आधिकारिक प्रश्न पंजीकरण',
    submitQueryForGov: 'सरकारी प्रणाली को अपना प्रश्न सबमिट करें। आपके प्रश्न को हमारे AI एजेंट द्वारा संसाधित किया जाएगा।',
    queryPlaceholder: 'यहाँ अपना प्रश्न या प्रतिक्रिया दर्ज करें...',
    
    // Common UI elements
    refresh: 'रीफ्रेश करें',
    close: 'बंद करें',
    submit: 'सबमिट करें',
    cancel: 'रद्द करें',
    loading: 'लोड हो रहा है',
    error: 'त्रुटि',
    success: 'सफलता',
    failed: 'विफल',
    
    // Contact Info - Additional fields
    aboutThisService: 'इस सेवा के बारे में',
    aboutThisServiceDesc: 'यह AI-संचालित वॉयस कॉलिंग सेवा नागरिकों को सरकारी संबंधित प्रश्नों और जानकारी के साथ सहायता करने के लिए डिज़ाइन की गई है। हमारी प्रणाली हिंदी और अंग्रेजी दोनों भाषाओं का समर्थन करती है और आपकी सुविधा के लिए 24/7 उपलब्ध है। सभी कॉल्स रिकॉर्ड रखने के उद्देश्य के लिए लॉग और दस्तावेज़ किए जाते हैं।',
    technicalSupport: 'तकनीकी समर्थन',
    technicalSupportDesc: 'कॉलिंग सेवा के साथ तकनीकी समस्याओं या सहायता के लिए, कृपया हमारी सहायता टीम से support@india.gov.in पर संपर्क करें या व्यावसायिक समय के दौरान कॉल करें।',
    saturdaySundayClosed: 'शनिवार और रविवार: बंद',
  }
}
