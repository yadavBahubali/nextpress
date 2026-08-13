'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { X, User, MapPin, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { State, City } from 'country-state-city';
import Select from 'react-select';

import { useRoomConfigStore } from '@/store/roomConfigStore';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { setUserRole, setRegionInfo, setStep: setWizardStep } = useRoomConfigStore();
  const [step, setStep] = useState(1);
  const [selectedState, setSelectedState] = useState<{ value: string, label: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ value: string, label: string } | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setSelectedState(null);
        setSelectedCity(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePartnerClick = () => {
    setUserRole('partner');
    onClose();
    router.push('/login?type=partner');
  };

  const handleCustomerClick = () => {
    setUserRole('customer');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleNext = () => {
    if (selectedState && selectedCity) {
      setRegionInfo('Asia Pacific', 'IN', selectedState.value, selectedCity.value, 'Enterprise');
      setWizardStep(1);
      onClose();
      router.push('/room-configurator/designer');
    }
  };

  // Get Indian States
  const states = useMemo(() => {
    return State.getStatesOfCountry('IN').map(s => ({
      value: s.isoCode,
      label: s.name
    }));
  }, []);

  // Get Cities of selected State
  const cities = useMemo(() => {
    if (!selectedState) return [];
    return City.getCitiesOfState('IN', selectedState.value).map(c => ({
      value: c.name,
      label: c.name
    }));
  }, [selectedState]);

  // Custom styles for react-select to match Bootstrap/NextPress look
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '45px',
      height: '45px',
      borderRadius: '10px',
      borderColor: '#dee2e6',
      boxShadow: 'none',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      '&:hover': {
        borderColor: '#2563eb'
      }
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: '0 15px',
      display: 'flex',
      alignItems: 'center',
      height: '43px',
    }),
    singleValue: (base: any) => ({
      ...base,
      margin: 0,
      color: '#212529',
      lineHeight: '43px'
    }),
    placeholder: (base: any) => ({
      ...base,
      margin: 0,
      lineHeight: '43px'
    }),
    input: (base: any) => ({
      ...base,
      margin: 0,
      padding: 0
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      height: '43px',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#f0f4ff' : 'white',
      color: state.isSelected ? 'white' : '#212529',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '10px 15px'
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-backdrop-custom"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="modal-container-custom shadow-lg"
          >
            <div className="row g-0 h-100">
              {/* Left Panel - Visual Branding */}
              <div className="col-md-5 d-none d-md-flex left-panel">
                <Image 
                  src="/assets/room-configurator/banner.jpg" 
                  alt="NextPress Branding" 
                  fill 
                  style={{ objectFit: 'cover' }}
                  priority
                />
                <div className="panel-overlay"></div>
                <div className="panel-content text-center">
                  <h2 className="fs-3 fw-bold text-white mb-2">Experience Innovation</h2>
                  <p className="text-white-50 small mb-0">
                    Tailor your workspace with precision.
                  </p>
                </div>
              </div>

              {/* Right Panel - Action Hub */}
              <div className="col-md-7 col-12 right-panel p-4 p-lg-5">
                {/* Close Button */}
                <button 
                  onClick={onClose}
                  className="btn-close-custom"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>

                <div className="h-100 d-flex flex-column justify-content-center">
                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                      >
                        <div className="avatar-badge mb-3">
                          <User size={32} strokeWidth={2.5} />
                        </div>
                        <h4 className="fw-bold text-dark mb-1">Welcome to NextPress</h4>
                        <p className="text-muted small mb-4">Please choose your entry path</p>
                        <div className="row g-2 mb-4 ">
                          {/* <div className="col-sm-6">
                            <button onClick={handlePartnerClick} className="btn btn-primary w-100 py-3 fw-normal rounded-3 shadow-sm btn-partner">
                              I'm a partner
                            </button>
                          </div> */}
                          <div className="col-sm- 6">
                            <button onClick={handleCustomerClick} className="btn btn-outline-secondary w-100 py-3 fw-normal rounded-3 btn-customer">
                              I'm a customer
                            </button>
                          </div>
                        </div>
                        {/* <p className="x-small text-muted mb-0">
                          Create a partner account or sign in with your shared credentials.
                        </p> */}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                      >
                        <div className="avatar-badge mb-3">
                          <MapPin size={32} strokeWidth={2.5} />
                        </div>
                        <h4 className="fw-bold text-dark mb-1">Select your location</h4>
                        <p className="text-muted small mb-4">India Region: Choose your state and city</p>

                        <div className="text-start mb-3">
                          <label className="form-label x-small text-muted mb-1">State</label>
                          <Select
                            options={states}
                            value={selectedState}
                            onChange={(val) => { setSelectedState(val); setSelectedCity(null); }}
                            placeholder="Select State"
                            styles={selectStyles}
                          />
                        </div>

                        <div className="text-start mb-4">
                          <label className="form-label x-small text-muted mb-1">City</label>
                          <Select
                            options={cities}
                            value={selectedCity}
                            onChange={(val) => setSelectedCity(val)}
                            placeholder="Select City"
                            isDisabled={!selectedState}
                            styles={selectStyles}
                          />
                        </div>

                        <div className="row g-2">
                          <div className="col-sm-6">
                            <button onClick={handleBack} className="btn btn-outline-secondary w-100 py-3 fw-normal rounded-3 btn-customer d-flex align-items-center justify-content-center">
                              <ChevronLeft size={18} className="me-1" /> Back
                            </button>
                          </div>
                          <div className="col-sm-6">
                            <button
                              onClick={handleNext}
                              disabled={!selectedState || !selectedCity}
                              className={`btn w-100 py-3 fw-normal rounded-3 shadow-sm ${
                                (selectedState && selectedCity) ? 'btn-primary btn-partner' : 'btn-secondary disabled-btn'
                              }`}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          <style >{`
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 1rem;
            }
            .modal-backdrop-custom {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.6);
              backdrop-filter: blur(4px);
            }
            .modal-container-custom {
              position: relative;
              width: 100%;
              max-width: 760px;
              background-color: white;
              border-radius: 1.5rem;
              overflow: hidden; 
            }
            .left-panel {
              background-color: #0a0a0b;
              position: relative;
              align-items: center;
              justify-content: center;
              padding: 2rem;
            }
            .panel-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7));
              z-index: 1;
            }
            .panel-content {
              position: relative;
              z-index: 10;
            }
            .right-panel {
              position: relative;
              background-color: white;
            }
            .btn-close-custom {
              position: absolute;
              top: 1rem;
              right: 1rem;
              background: none;
              border: none;
              color: #adb5bd;
              transition: color 0.2s;
              z-index: 20;
            }
            .btn-close-custom:hover {
              color: #212529;
            }
            .avatar-badge {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 4rem;
              height: 4rem;
              background-color: #2563eb;
              border-radius: 50%;
              color: white;
              box-shadow: 0 8px 12px -3px rgba(37, 99, 235, 0.2);
            }
            .btn-partner {
              background-color: #1f2957;
              border-color: #1f2957;
              font-size: 15px;
            }
            .btn-partner:hover {
              background-color: #151d3d;
              border-color: #151d3d;
            }
            .btn-customer {
              border-color: #dee2e6;
              color: #212529;
              font-size: 15px;
            }
            .btn-customer:hover {
              border-color: #2563eb;
              color: #2563eb;
              background-color: transparent;
            }
            .disabled-btn {
              background-color: #e9ecef;
              border-color: #e9ecef;
              color: #6c757d;
              cursor: not-allowed;
            }
            .x-small {
              font-size: 11px;
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
