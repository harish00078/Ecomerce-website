import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const Orders = () => {
  return (
    <Container>
      <Title>My Orders</Title>
      {/* Add your orders content here */}
    </Container>
  );
};

export default Orders;
