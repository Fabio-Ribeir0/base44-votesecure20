import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

import Header from '@/components/Header';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import CreateOrganizationModal from '@/components/modals/CreateOrganizationModal';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadUserAndTenant();
  }, []);

  const loadUserAndTenant = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
        
        if (userData.tenant_id) {
          const tenants = await base44.entities.Tenant.filter({ id: userData.tenant_id });
          if (tenants.length > 0) {
            setTenant(tenants[0]);
            
            // Redirect to dashboard if user has active tenant
            if (['trialing', 'active'].includes(tenants[0].status)) {
              navigate(createPageUrl('Dashboard'));
              return;
            }
          }
        }
      }
    } catch (error) {
      console.log('User not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    const plansSection = document.getElementById('planos');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPlan = async (plan) => {
    const isAuth = await base44.auth.isAuthenticated();
    
    if (!isAuth) {
      // Save selected plan to localStorage and redirect to login
      localStorage.setItem('selectedPlan', JSON.stringify(plan));
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    // User is authenticated
    if (tenant && ['trialing', 'active'].includes(tenant.status)) {
      // Already has active tenant, go to dashboard
      navigate(createPageUrl('Dashboard'));
      return;
    }

    // Show organization creation modal
    setSelectedPlan(plan);
    setShowOrgModal(true);
  };

  const handleCreateOrganization = async (orgData) => {
    setIsCreating(true);
    try {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days

      // Create tenant
      const newTenant = await base44.entities.Tenant.create({
        ...orgData,
        status: 'trialing',
        plano_ativo: selectedPlan.id,
        data_inicio_trial: now.toISOString(),
        data_fim_trial: trialEnd.toISOString()
      });

      // Update user with tenant reference and admin role
      await base44.auth.updateMe({
        tenant_id: newTenant.id,
        perfil_tenant: 'Administrador'
      });

      toast.success('Organização criada com sucesso!');
      setShowOrgModal(false);
      
      // Redirect to dashboard (in MVP, skip Stripe checkout)
      navigate(createPageUrl('Dashboard'));
      
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Erro ao criar organização. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  // Check for saved plan after login
  useEffect(() => {
    if (user && !tenant) {
      const savedPlan = localStorage.getItem('selectedPlan');
      if (savedPlan) {
        setSelectedPlan(JSON.parse(savedPlan));
        setShowOrgModal(true);
        localStorage.removeItem('selectedPlan');
      }
    }
  }, [user, tenant]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#1976D2', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header user={user} tenant={tenant} />
      
      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <FeaturesSection />
        <PricingSection 
          onSelectPlan={handleSelectPlan}
          isAuthenticated={!!user}
        />
        <TestimonialsSection />
        <CTASection onGetStarted={handleGetStarted} />
      </main>

      <Footer />

      <CreateOrganizationModal
        open={showOrgModal}
        onOpenChange={setShowOrgModal}
        selectedPlan={selectedPlan}
        onSubmit={handleCreateOrganization}
        isLoading={isCreating}
      />
    </div>
  );
}