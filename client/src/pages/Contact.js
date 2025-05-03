import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/reducers/snackbarSlice";

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.text_primary};
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContactInfo = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.bgLight};
  border-radius: 10px;
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.text_secondary};
  border-radius: 5px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.text_secondary};
  border-radius: 5px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  min-height: 150px;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  opacity: ${({ $isLoading }) => ($isLoading ? 0.7 : 1)};
  pointer-events: ${({ $isLoading }) => ($isLoading ? "none" : "auto")};

  &:hover {
    opacity: 0.9;
  }
`;

const Error = styled.span`
  color: ${({ theme }) => theme.error};
  font-size: 0.8rem;
`;

const Contact = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Add your API call here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
      dispatch(
        openSnackbar({
          message: "Message sent successfully!",
          severity: "success",
        })
      );
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      dispatch(
        openSnackbar({
          message: error.message || "Failed to send message. Please try again.",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Contact Us</Title>
      <ContactGrid>
        <ContactInfo>
          <h2>Get in Touch</h2>
          <p>
            We'd love to hear from you! Please fill out the form or use our
            contact information below.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <h3>Email</h3>
            <p>support@yourstore.com</p>
            <h3>Phone</h3>
            <p>+1 (555) 123-4567</p>
            <h3>Address</h3>
            <p>
              123 Shopping Street
              <br />
              New York, NY 10001
              <br />
              United States
            </p>
          </div>
        </ContactInfo>
        <ContactForm onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          {errors.name && <Error>{errors.name}</Error>}

          <Input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          {errors.email && <Error>{errors.email}</Error>}

          <Input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            error={errors.subject}
            required
          />
          {errors.subject && <Error>{errors.subject}</Error>}

          <TextArea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            error={errors.message}
            required
          />
          {errors.message && <Error>{errors.message}</Error>}

          <Button type="submit" $isLoading={loading}>
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </ContactForm>
      </ContactGrid>
    </Container>
  );
};

export default Contact;
