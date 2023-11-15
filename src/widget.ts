// Add necessary import statements
import fetch from 'node-fetch'; // If not already installed, run: npm install node-fetch
const sendChatBtn = document.querySelector(".chat-input span") as HTMLSpanElement;
const chatInput = document.querySelector(".chat-input textarea") as HTMLTextAreaElement;
const chatbox = document.querySelector(".chatbox") as HTMLUListElement;
const chatbotToggler = document.querySelector(".chatbot-toggler") as HTMLButtonElement;
const chatbotCloseBtn = document.querySelector(".close-btn") as HTMLSpanElement;


let userMessage: string;
const inputInitHeight = chatInput.scrollHeight;

if (chatInput) {
    chatInput.addEventListener("input", () => {
        // Adjust the height of textarea based on its content 
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });
}

const createChatLi = (message: string, className: string): HTMLLIElement => {
    // create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p")!.textContent = message;
    return chatLi;
}

document.getElementById("drop-menu")!.addEventListener("click", function () {
    var menu = document.getElementById("menu");
    if (menu!.style.visibility === "hidden") {
        menu!.style.visibility = "visible";
    } else {
        menu!.style.visibility = "hidden";
    }
});


function toggleEmojiMenu() {
    var menu = document.getElementById("emoji-menu");
    if (menu!.style.visibility === "hidden") {
        menu!.style.visibility = "visible";
    } else {
        menu!.style.visibility = "hidden";
    }
  }

// Event listener for the emoji button
document.getElementById("mood-menu")!.addEventListener("click", toggleEmojiMenu);

// Select all elements with the class "emoji" within the .emoji-menu
// Event listeners for emoji items
var emojiItems = document.querySelectorAll(".menu-active[data-emoji]");
emojiItems.forEach(function (item) {
  item.addEventListener("click", function () {
    var selectedEmoji = item.getAttribute("data-emoji");
    if (selectedEmoji) {
      // Do something with the selected emoji
    //   console.log("Selected Emoji: " + selectedEmoji);
      chatInput.value += selectedEmoji; // Insert the emoji into the input field
      toggleEmojiMenu(); // Close the emoji menu after selection
    }
  });
});

// Customize the action later
document.addEventListener('DOMContentLoaded', function () {
    const reportIssueElement = document.getElementById('report-issue');
    
    reportIssueElement!.addEventListener('click', function () {
        // Your click event handling code here
        alert('Report an issue clicked'); // Example: Show an alert when clicked
    });
  });
// ...
// Define a function to create option buttons
function createOptionButtons(options: string[]): HTMLDivElement {
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("option-buttons");

    options.forEach((option) => {
        const optionButton = document.createElement("button");
        optionButton.classList.add("emoji-button");
        optionButton.setAttribute("data-value", option); // Store the option label as data-value

        optionButton.innerText = option;
        buttonContainer.appendChild(optionButton);
    });

    return buttonContainer;
}

if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
        // if enter key is pressed without a Shift key and the window
        // width is greater than 800px, handle the chat
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });
}

// Assuming your Flask server is running on http://localhost:5000
let ratingAsked = false;

async function handleChat() {
    userMessage = chatInput.value;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Adjust the height of the header
    // const chatbotHeader = document.querySelector('.chatbot header') as HTMLElement;
    // const originalHeaderHeight = chatbotHeader.clientHeight;
    // chatbotHeader.style.height = `${originalHeaderHeight - 30}px`; // Adjust the height as needed
    // // Hide span elements
    // const spanElements = document.querySelectorAll('.chatbot header span');
    // spanElements.forEach((element) => {
    //     spanElements.style.display = 'none';
    // });

    // Display "Thinking..." message while waiting for a response
    const thinkingLi = createChatLi("Thinking...", "incoming");
    const thinkingMessageElement = thinkingLi.querySelector("p") as HTMLParagraphElement;
    chatbox.appendChild(thinkingLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);

    try {
        // Assuming your Flask server is running on http://localhost:5000
        const response = await fetch("/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question: userMessage }),
        });


        const data = await response.json();

        // Replace the "Thinking..." message with the actual response data
        thinkingMessageElement.textContent = data.response;

        // Update the chat UI with the AI response
        const incomingChatLi = createChatLi(data.response, "incoming");
        chatbox.replaceChild(incomingChatLi, thinkingLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

    } catch (error) {
        console.error("Error:", error);
        // Handle errors, for example, display an error message in the chatbox
        const errorChatLi = createChatLi("Error occurred. Please try again.", "incoming");
        chatbox.replaceChild(errorChatLi, thinkingLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }

    // Check if the rating has not been asked yet
    if (!ratingAsked) {
        // Add the ratingContainer to the chatbox before appending the rating message
        const ratingContainer = document.createElement("div");
        ratingContainer.classList.add("rating-container"); // Add the "rating-container" class
        chatbox.appendChild(ratingContainer);

        setTimeout(() => {
            const ratingMessage = createChatLi(
                "How would you rate this conversation? Choose emoji:",
                "incoming"
            );

            // Add the "rating-message" class to the rating message element
            ratingMessage.classList.add("rating-message");

            const emojis = ["😃", "😐", "😞"];
            const emojiButtons = document.createElement("div");
            emojiButtons.classList.add("emoji-buttons");

            emojis.forEach((emoji) => {
                const emojiButton = document.createElement("button");
                emojiButton.classList.add("emoji-button");
                emojiButton.innerText = emoji;

                emojiButton.addEventListener("click", () => {
                    // Handle the user's rating here, e.g., send it to your server
                    const selectedEmoji = emoji;
                     // Add a message indicating the selected rating
                     const ratingResponse = createChatLi(
                        `Ви оцінили розмову як: ${selectedEmoji}`,
                        "incoming"
                    );
                    chatbox.appendChild(ratingResponse);
                    chatbox.scrollTo(0, chatbox.scrollHeight);
                });

                emojiButtons.appendChild(emojiButton);
            });
            ratingMessage.appendChild(emojiButtons);
            ratingContainer.appendChild(ratingMessage); // Add the rating message to the rating container
            chatbox.scrollTo(0, chatbox.scrollHeight);

            // Set the ratingAsked flag to true to prevent asking again
            ratingAsked = true;
        }, 3000); // Wait for 3 seconds (3000 milliseconds)
    }
}

// Add the event listener for the button outside the function
sendChatBtn.addEventListener("click", handleChat);

chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

export type OptionsButtons = {
    text?: string[];
    quickReplyButtonBackground?: string;
    quickReplyButtonBorderBottom?: string;
    buttonMessages?: Record<string, string>; // Allow users to set messages for each button
};

export function updateOptionsButtons(options: OptionsButtons) {
    const quickReplyList = document.querySelector('.chat.quick-reply') as HTMLLIElement;

    if (options.text) {
        quickReplyList.innerHTML = ''; // Remove existing buttons
    
        options.text.forEach((buttonText: string, index: number) => {
            const buttonId = `quick-reply-button-${index}`;
            const buttonElement = document.createElement('button');
            buttonElement.className = 'quick-reply-button';
            buttonElement.textContent = buttonText;
            buttonElement.id = buttonId; // Assign a unique ID to the button
            quickReplyList.appendChild(buttonElement);
    
            // Add a click event listener for each button
            buttonElement.addEventListener('click', () => {
                let incomingChatLi;
                let messageElement;

                // Handle the click event for the button with the specified ID
                const customMessage = options.buttonMessages?.[buttonId];
                const messageText = customMessage !== undefined ? customMessage : `Button ${index + 1} clicked`;

                incomingChatLi = createChatLi(messageText, "incoming");
                messageElement = incomingChatLi.querySelector("p");

                // Display thinking message while waiting for response
                chatbox.appendChild(incomingChatLi);
                chatbox.scrollTo(0, chatbox.scrollHeight);
            });
        });
    }

    if (options.quickReplyButtonBackground) {
        quickReplyList.style.background = options.quickReplyButtonBackground;
    }

    // Customize .quick-reply-button
    const quickReplyButtons = document.querySelectorAll('.quick-reply-button') as NodeListOf<HTMLButtonElement>;

    // Loop through all the buttons except the last one
    for (let i = 0; i < quickReplyButtons.length - 1; i++) {
        const button = quickReplyButtons[i];

        if (options.quickReplyButtonBackground) {
            button.style.background = options.quickReplyButtonBackground;
        }
        if (options.quickReplyButtonBorderBottom) {
            button.style.borderBottom = options.quickReplyButtonBorderBottom;
        }
    }

    // Now, target the last button and remove its border-bottom
    const lastButton = quickReplyButtons[quickReplyButtons.length - 1];
    if (options.quickReplyButtonBackground) {
        lastButton.style.background = options.quickReplyButtonBackground;
    }
    // Remove the border-bottom for the last button
    lastButton.style.borderBottom = 'none';
}

export type ChatbotOptions = {
    chatbotBackground?: string;
    chatbotTogglerBackground?: string;
    chatbotTogglerPosition?: { right?: string; bottom?: string };
    chatbotTogglerSize?: { height?: string; width?: string };
    headerMessage?: string;
    logoContent?: string;
    inputPlaceholder?: string;
    // ... add other properties as needed
}

export function setStyle(element: HTMLElement, styleObject: Record<string, string | undefined>) {
    Object.assign(element.style, styleObject);
}

export function customizeElement(selector: string, styles: Record<string, string | undefined>) {
    const element = document.querySelector(selector) as HTMLElement | null;
    if (element) {
        setStyle(element, styles);
    }
}

export function customizeChatbot(options: ChatbotOptions) {
    // Customize .chatbot
    customizeElement('.chatbot', { background: options.chatbotBackground });

    // Customize .chatbot-toggler
    customizeElement('.chatbot-toggler', {
        background: options.chatbotTogglerBackground,
        right: options.chatbotTogglerPosition?.right,
        bottom: options.chatbotTogglerPosition?.bottom,
        height: options.chatbotTogglerSize?.height,
        width: options.chatbotTogglerSize?.width,
    });

    // ... (customize other elements)

    // Customize message in <header>
    const headerH2 = document.querySelector('.chatbot header h2') as HTMLHeadingElement | null;
    if (headerH2 && options.headerMessage) {
        headerH2.innerHTML = options.headerMessage;
    }

    // Customize content in <div class="logo">
    const logoDiv = document.querySelector('.logo') as HTMLDivElement | null;
    if (logoDiv && options.logoContent) {
        logoDiv.innerHTML = options.logoContent;
    }
}

export function customizeChatbotInit() {
    // Read custom options from data attribute
    const scriptTag = document.querySelector('script[data-custom-options]');
    const customOptionsString = scriptTag?.getAttribute('data-custom-options') || '{}';
    const customOptions: ChatbotOptions = JSON.parse(customOptionsString);

    const defaultOptions: ChatbotOptions = {
        // ... (default options)
    };

    const options: ChatbotOptions = { ...defaultOptions, ...customOptions };

    customizeChatbot(options);
}

export function customizeOptionsButtons() {
    // Read custom options from data attribute
    const scriptTag = document.querySelector('script[data-custom-options]');
    const customOptionsButtons = scriptTag?.getAttribute('data-custom-options') || '{}';
    const customOptions: OptionsButtons = JSON.parse(customOptionsButtons);

    const defaultOptions: OptionsButtons = {
        // ... (default options)
    };

    const options: OptionsButtons = { ...defaultOptions, ...customOptions };

    updateOptionsButtons(options);
}

document.addEventListener('DOMContentLoaded', function () {
    customizeChatbotInit();
    customizeOptionsButtons();
});



// function customizeChatbot(options: any) {
    
//     updateOptionsButtons(options);

//     // Customize .chatbot
//     const chatbot = document.querySelector('.chatbot') as HTMLElement;
//     if (options.chatbotBackground) {
//         chatbot.style.background = options.chatbotBackground;
//     }

//     // Customize .chatbot-toggler
//     const chatbotToggler = document.querySelector('.chatbot-toggler') as HTMLButtonElement;
//     if (options.chatbotTogglerBackground) {
//         chatbotToggler.style.background = options.chatbotTogglerBackground;
//     }
//     if (options.chatbotTogglerPosition) {
//         chatbotToggler.style.right = options.chatbotTogglerPosition.right;
//         chatbotToggler.style.bottom = options.chatbotTogglerPosition.bottom;
//     }
//     if (options.chatbotTogglerSize) {
//         chatbotToggler.style.height = options.chatbotTogglerSize.height;
//         chatbotToggler.style.width = options.chatbotTogglerSize.width;
//     }

//     // Customize .chatbot header
//     const chatbotHeader = document.querySelector('.chatbot header') as HTMLElement;
//     if (options.chatbotHeaderBackground) {
//         chatbotHeader.style.background = options.chatbotHeaderBackground;
//     }

//      // Customize .chatbot header h2
//      const h2Elements = document.querySelectorAll('.chatbot header h2') as NodeListOf<HTMLElement>;
//      h2Elements.forEach((element) => {
//          if (options.h2Color) {
//              element.style.color = options.h2Color;
//          }
//          if (options.h2FontSize) {
//              element.style.fontSize = options.h2FontSize;
//             }
//         });

//          // Customize .chatbot header span
//     const spanElements = document.querySelectorAll('.chatbot header span') as NodeListOf<HTMLElement>;
//     spanElements.forEach((element) => {
//         if (options.spanColor) {
//             element.style.color = options.spanColor;
//         }
//     });

//     // Customize .chatbox .incoming span
//     const incomingSpan = document.querySelector('.chatbox .incoming span') as HTMLElement;
//     if (options.incomingSpanBackground) {
//         incomingSpan.style.background = options.incomingSpanBackground;
//     }
//     if (options.incomingSpanColor) {
//         incomingSpan.style.color = options.incomingSpanColor;
//     }

//     // Customize .chatbox .incoming p
//     const incomingP = document.querySelector('.chatbox .incoming p') as HTMLElement;
//     if (options.incomingPColor) {
//         incomingP.style.color = options.incomingPColor;
//     }
//     if (options.incomingPBackground) {
//         incomingP.style.background = options.incomingPBackground;
//     }

//     // Customize .chatbox .chat p
//     const chatPElements = document.querySelectorAll('.chatbox .chat p') as NodeListOf<HTMLElement>;
//     chatPElements.forEach((element) => {
//         if (options.chatPColor) {
//             element.style.color = options.chatPColor;
//         }
//         if (options.chatPMaxWidth) {
//             element.style.maxWidth = options.chatPMaxWidth;
//         }
//         if (options.chatPFontSize) {
//             element.style.fontSize = options.chatPFontSize;
//         }
//         if (options.chatPBackground) {
//             element.style.background = options.chatPBackground;
//         }
//     });

//     // Customize .menu
//     const menu = document.querySelector('.menu') as HTMLElement;
//     if (options.menuWidth) {
//         menu.style.width = options.menuWidth;
//     }
//     if (options.menuHeight) {
//         menu.style.height = options.menuHeight;
//     }
//     if (options.menuBackground) {
//         menu.style.background = options.menuBackground;
//     }

//     // Customize .logo
//     const logo = document.querySelector('.logo') as HTMLElement;
//     if (options.logoColor) {
//         logo.style.color = options.logoColor;
//     }
//     if (options.logoOpacity) {
//         logo.style.opacity = options.logoOpacity;
//     }
//     if (options.logoTextAlign) {
//         logo.style.textAlign = options.logoTextAlign;
//     }
//     if (options.logoPaddingLeft) {
//         logo.style.paddingLeft = options.logoPaddingLeft;
//     }
//     if (options.logoPaddingTop) {
//         logo.style.paddingTop = options.logoPaddingTop;
//     }

//     // Customize message in <header>
//     const headerH2 = document.querySelector('.chatbot header h2') as HTMLElement;
//     if (options.headerMessage) {
//         headerH2.innerHTML = options.headerMessage;
//     }

//     // Customize content in <div class="logo">
//     const logoDiv = document.querySelector('.logo') as HTMLElement;
//     if (options.logoContent) {
//         logoDiv.innerHTML = options.logoContent;
//     }

//     // Customize placeholder for the chat input
//     const chatInput = document.querySelector('.chat-input textarea') as HTMLTextAreaElement;
//     if (options.inputPlaceholder) {
//         chatInput.placeholder = options.inputPlaceholder;
//     }
// };

// function customizeChatbot(userOptions = {}){
//     const defaultOptions = {
//         chatbotBackground: 'blue',
//         chatbotTogglerBackground: 'green',
//         chatbotTogglerPosition: {
//             right: '10px',
//             bottom: '10px',
//         },
//         chatbotTogglerSize: {
//             height: '50px',
//             width: '50px',
//         },
//         chatbotHeaderBackground: 'orange',
//         h2Color: 'white',
//         h2FontSize: '1.5rem',
//         spanColor: 'yellow',
//         quickReplyBackground: 'green',
//         quickReplyButtonBorderBottom: '10px solid red',
//         quickReplyButtonBackground: 'green',
//         chooseOptionH3Color: 'black',
//         incomingSpanBackground: 'blue',
//         incomingSpanColor: 'white',
//         incomingPColor: 'black',
//         incomingPBackground: 'white',
//         chatPColor: 'white',
//         chatPMaxWidth: '75%',
//         chatPFontSize: '0.95rem',
//         chatPBackground: '#724ae8',
//         // errorPColor: '#721c24',
//         // errorPBackground: '#f8d7d',
//         menuWidth: '100px',
//         menuHeight: '50px',
//         menuBackground: '#fff',
//         logoColor: '#fff',
//         logoOpacity: '80%',
//         logoTextAlign: 'left',
//         logoPaddingLeft: '20px',
//         logoPaddingTop: '10px',
//         headerMessage: 'Custom Welcome Message',
//         logoContent: `
//       To ShiBOT live chat with AI company.<br>
//       We're always online and ready to chat!
//     `,
//         buttons: ['Option 1', 'Option 2', 'Option 3'], // Add or delete buttons
//         inputPlaceholder: 'Enter your message...',
//     }};

//     const options = { ...defaultOptions, ...userOptions };

//     updateOptionsButtons(options);

