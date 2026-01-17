import streamlit as st
import requests
from datetime import datetime

# 🔥 Render backend URL
BACKEND_URL = "http://localhost:8000/api"

st.set_page_config(
    page_title="Yoga Wellness RAG",
    page_icon="🧘",
    layout="centered"
)

st.title("🧘 Ask Me Anything About Yoga")

st.markdown(
    "This micro-app answers yoga & fitness questions using a **RAG (Retrieval-Augmented Generation)** pipeline, "
    "with built-in safety filters for pregnancy and medical conditions."
)

query = st.text_area(
    "Ask anything about yoga",
    placeholder='Example: "What are the benefits of Shavasana for stress?"'
)

col1, col2 = st.columns([1, 4])
with col1:
    ask_clicked = st.button("Ask", type="primary")
with col2:
    st.write("")

if ask_clicked and query.strip():
    with st.spinner("Thinking..."):
        try:
            resp = requests.post(
                f"{BACKEND_URL}/ask",
                json={"query": query},
                timeout=60
            )

            if resp.status_code != 200:
                st.error("Server error. Please try again.")
            else:
                data = resp.json()

                # 🚨 Safety warning block
                if data.get("isUnsafe"):
                    st.markdown(
                        "<div style='border-left:4px solid #DC2626; padding:0.6rem 1rem; background:#FEE2E2; border-radius:6px;'>"
                        "<strong>⚠ Safety warning:</strong><br/>"
                        f"{data.get('safetyMessage') or 'Your question may involve health risks.'}"
                        "</div>",
                        unsafe_allow_html=True,
                    )

                    if data.get("suggestion"):
                        st.info(f"💡 {data.get('suggestion')}")

                # 🧠 AI Answer
                st.markdown("### 🧠 AI Answer")
                st.markdown(
                    f"<div style='animation: fadein 0.4s;'>"
                    f"{data.get('answer','No answer')}"
                    f"</div>",
                    unsafe_allow_html=True
                )

                # 📚 RAG Sources
                st.markdown("### 📚 Sources used")
                sources = data.get("sources", [])
                if not sources:
                    st.write("No specific sources were used for this answer.")
                else:
                    for i, src in enumerate(sources, start=1):
                        st.markdown(
                            f"- **Source {i}** – {src.get('title','Unknown')} "
                            f"(id: `{src.get('id')}`)"
                        )

                # 👍👎 Feedback
                st.markdown("---")
                st.markdown("#### Was this helpful?")

                fb_col1, fb_col2 = st.columns(2)
                with fb_col1:
                    if st.button("👍 Yes"):
                        try:
                            requests.post(
                                f"{BACKEND_URL}/feedback",
                                json={
                                    "query": query,
                                    "rating": "up",
                                    "notes": ""
                                },
                                timeout=10,
                            )
                            st.success("Thanks for your feedback!")
                        except Exception:
                            st.warning("Could not send feedback.")

                with fb_col2:
                    if st.button("👎 No"):
                        try:
                            requests.post(
                                f"{BACKEND_URL}/feedback",
                                json={
                                    "query": query,
                                    "rating": "down",
                                    "notes": ""
                                },
                                timeout=10,
                            )
                            st.success("Thanks for your feedback!")
                        except Exception:
                            st.warning("Could not send feedback.")

        except requests.exceptions.RequestException:
            st.error("Unable to reach backend. Please try again in a moment.")

elif ask_clicked:
    st.warning("Please enter a question first.")
