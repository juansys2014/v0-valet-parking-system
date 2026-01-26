export const translations = {
  es: {
    // Navigation
    nav: {
      entry: 'Entrada',
      exit: 'Salida',
      active: 'Activos',
      alerts: 'Alertas',
      history: 'Historial',
    },
    
    // Common
    common: {
      search: 'Buscar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      back: 'Volver',
      close: 'Cerrar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      noResults: 'No se encontraron resultados',
      required: 'requerido',
      optional: 'opcional',
      yes: 'Sí',
      no: 'No',
      or: 'o',
      language: 'Idioma',
    },

    // Header
    header: {
      title: 'Valet Parking',
      subtitle: 'Sistema de Control',
    },

    // Check-in
    checkin: {
      title: 'Registro de Entrada',
      subtitle: 'Ingrese los datos del vehículo',
      ticketCode: 'Código de Ticket',
      ticketPlaceholder: 'Ej: 001234',
      scanQR: 'Escanear QR',
      licensePlate: 'Patente',
      licensePlaceholder: 'Ej: ABC 123',
      parkingSpot: 'Ubicación',
      parkingPlaceholder: 'Ej: A1, B2',
      attendantName: 'Nombre del encargado',
      attendantPlaceholder: 'Tu nombre',
      notes: 'Observaciones',
      notesPlaceholder: 'Daños, características especiales...',
      mediaSection: 'Fotos y Videos',
      registerEntry: 'Registrar Entrada',
      vehicleRegistered: 'Vehículo registrado correctamente',
    },

    // Check-out
    checkout: {
      title: 'Solicitud de Salida',
      subtitle: 'Busque el vehículo a retirar',
      searchPlaceholder: 'Buscar por ticket o patente...',
      availableVehicles: 'Vehículos disponibles',
      otherVehicles: 'Otros vehículos',
      confirmRequest: 'Confirmar Solicitud',
      confirmQuestion: '¿Desea solicitar la salida de este vehículo?',
      requestExit: 'Solicitar Salida',
      requestSent: 'Solicitud enviada',
      requestSentDesc: 'Aparecerá en Alertas para que el personal lo prepare',
      noVehiclesAvailable: 'No hay vehículos disponibles',
      vehicleInfo: 'Información del vehículo',
      // Salida rápida (vehículo no registrado)
      quickExit: 'Salida Rápida',
      quickExitDesc: 'El vehículo no está registrado en el sistema',
      quickExitQuestion: '¿Desea dar salida a este vehículo sin registro previo?',
      quickExitConfirm: 'Confirmar Salida',
      quickExitSuccess: 'Salida registrada',
      quickExitSuccessDesc: 'El vehículo fue dado de baja sin registro previo',
      enterLicensePlate: 'Patente (opcional)',
      notRegistered: 'No registrado',
    },

    // Vehicles list
    vehicles: {
      title: 'Vehículos Estacionados',
      subtitle: 'Lista de vehículos actualmente en el valet parking',
      historyTitle: 'Historial de Entregas',
      historySubtitle: 'Registro de todos los vehículos entregados',
      searchPlaceholder: 'Buscar por ticket o patente...',
      noVehiclesParked: 'No hay vehículos estacionados',
      noHistory: 'No hay historial aún',
      request: 'Solicitar',
      entry: 'Entrada',
      exit: 'Salida',
      duration: 'Duración',
      location: 'Ubicación',
      quickExit: 'Salida rápida',
    },

    // Alerts / Notifications
    alerts: {
      title: 'Alertas',
      subtitle: 'Vehículos pendientes de preparar y entregar',
      requested: 'Solicitados',
      requestedDesc: 'Pendientes de preparar',
      ready: 'Listos',
      readyDesc: 'Listos para entregar al cliente',
      noAlerts: 'No hay alertas pendientes',
      allClear: 'Todos los vehículos están en orden',
      markReady: 'Marcar como Listo',
      confirmDelivery: 'Confirmar Entrega',
      yourName: 'Tu nombre',
      attendantPlaceholder: 'Nombre del encargado',
      waitingTime: 'Esperando',
    },

    // Vehicle details
    vehicle: {
      ticket: 'Ticket',
      licensePlate: 'Patente',
      status: 'Estado',
      location: 'Ubicación',
      entryTime: 'Hora de entrada',
      exitTime: 'Hora de salida',
      duration: 'Duración',
      attendant: 'Encargado',
      deliveryAttendant: 'Entregado por',
      notes: 'Observaciones',
      photos: 'Fotos',
      videos: 'Videos',
      media: 'Fotos y Videos',
      noMedia: 'Sin fotos ni videos',
      viewMedia: 'Ver multimedia',
    },

    // Status
    status: {
      parked: 'Estacionado',
      requested: 'Solicitado',
      ready: 'Listo',
      delivered: 'Entregado',
    },

    // Media capture
    media: {
      takePhoto: 'Tomar Foto',
      recordVideo: 'Grabar Video',
      addPhoto: 'Agregar Foto',
      addVideo: 'Agregar Video',
      stopRecording: 'Detener',
      usePhoto: 'Usar Foto',
      useVideo: 'Usar Video',
      retake: 'Repetir',
      recording: 'Grabando',
      cameraError: 'Error al acceder a la cámara',
      photos: 'fotos',
      videos: 'videos',
    },

    // QR Scanner
    qr: {
      title: 'Escanear QR',
      instructions: 'Apunte la cámara al código QR del ticket',
      error: 'Error al acceder a la cámara',
      notSupported: 'Escáner QR no soportado en este dispositivo',
    },

    // Time
    time: {
      hoursAgo: 'hace {hours}h {minutes}m',
      minutesAgo: 'hace {minutes}m',
      hours: '{hours}h {minutes}m',
      minutes: '{minutes}m',
    },
  },

  en: {
    // Navigation
    nav: {
      entry: 'Entry',
      exit: 'Exit',
      active: 'Active',
      alerts: 'Alerts',
      history: 'History',
    },
    
    // Common
    common: {
      search: 'Search',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      noResults: 'No results found',
      required: 'required',
      optional: 'optional',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      language: 'Language',
    },

    // Header
    header: {
      title: 'Valet Parking',
      subtitle: 'Control System',
    },

    // Check-in
    checkin: {
      title: 'Vehicle Entry',
      subtitle: 'Enter vehicle information',
      ticketCode: 'Ticket Code',
      ticketPlaceholder: 'E.g.: 001234',
      scanQR: 'Scan QR',
      licensePlate: 'License Plate',
      licensePlaceholder: 'E.g.: ABC 123',
      parkingSpot: 'Location',
      parkingPlaceholder: 'E.g.: A1, B2',
      attendantName: 'Attendant name',
      attendantPlaceholder: 'Your name',
      notes: 'Notes',
      notesPlaceholder: 'Damages, special features...',
      mediaSection: 'Photos and Videos',
      registerEntry: 'Register Entry',
      vehicleRegistered: 'Vehicle registered successfully',
    },

    // Check-out
    checkout: {
      title: 'Exit Request',
      subtitle: 'Search for the vehicle to retrieve',
      searchPlaceholder: 'Search by ticket or license plate...',
      availableVehicles: 'Available vehicles',
      otherVehicles: 'Other vehicles',
      confirmRequest: 'Confirm Request',
      confirmQuestion: 'Do you want to request the exit of this vehicle?',
      requestExit: 'Request Exit',
      requestSent: 'Request sent',
      requestSentDesc: 'It will appear in Alerts for staff to prepare',
      noVehiclesAvailable: 'No vehicles available',
      vehicleInfo: 'Vehicle information',
      // Quick exit (unregistered vehicle)
      quickExit: 'Quick Exit',
      quickExitDesc: 'Vehicle is not registered in the system',
      quickExitQuestion: 'Do you want to check out this vehicle without prior registration?',
      quickExitConfirm: 'Confirm Exit',
      quickExitSuccess: 'Exit registered',
      quickExitSuccessDesc: 'Vehicle was checked out without prior registration',
      enterLicensePlate: 'License plate (optional)',
      notRegistered: 'Not registered',
    },

    // Vehicles list
    vehicles: {
      title: 'Parked Vehicles',
      subtitle: 'List of vehicles currently in valet parking',
      historyTitle: 'Delivery History',
      historySubtitle: 'Record of all delivered vehicles',
      searchPlaceholder: 'Search by ticket or license plate...',
      noVehiclesParked: 'No parked vehicles',
      noHistory: 'No history yet',
      request: 'Request',
      entry: 'Entry',
      exit: 'Exit',
      duration: 'Duration',
      location: 'Location',
      quickExit: 'Quick exit',
    },

    // Alerts / Notifications
    alerts: {
      title: 'Alerts',
      subtitle: 'Vehicles pending preparation and delivery',
      requested: 'Requested',
      requestedDesc: 'Pending preparation',
      ready: 'Ready',
      readyDesc: 'Ready to deliver to client',
      noAlerts: 'No pending alerts',
      allClear: 'All vehicles are in order',
      markReady: 'Mark as Ready',
      confirmDelivery: 'Confirm Delivery',
      yourName: 'Your name',
      attendantPlaceholder: 'Attendant name',
      waitingTime: 'Waiting',
    },

    // Vehicle details
    vehicle: {
      ticket: 'Ticket',
      licensePlate: 'License Plate',
      status: 'Status',
      location: 'Location',
      entryTime: 'Entry time',
      exitTime: 'Exit time',
      duration: 'Duration',
      attendant: 'Attendant',
      deliveryAttendant: 'Delivered by',
      notes: 'Notes',
      photos: 'Photos',
      videos: 'Videos',
      media: 'Photos and Videos',
      noMedia: 'No photos or videos',
      viewMedia: 'View media',
    },

    // Status
    status: {
      parked: 'Parked',
      requested: 'Requested',
      ready: 'Ready',
      delivered: 'Delivered',
    },

    // Media capture
    media: {
      takePhoto: 'Take Photo',
      recordVideo: 'Record Video',
      addPhoto: 'Add Photo',
      addVideo: 'Add Video',
      stopRecording: 'Stop',
      usePhoto: 'Use Photo',
      useVideo: 'Use Video',
      retake: 'Retake',
      recording: 'Recording',
      cameraError: 'Error accessing camera',
      photos: 'photos',
      videos: 'videos',
    },

    // QR Scanner
    qr: {
      title: 'Scan QR',
      instructions: 'Point the camera at the ticket QR code',
      error: 'Error accessing camera',
      notSupported: 'QR scanner not supported on this device',
    },

    // Time
    time: {
      hoursAgo: '{hours}h {minutes}m ago',
      minutesAgo: '{minutes}m ago',
      hours: '{hours}h {minutes}m',
      minutes: '{minutes}m',
    },
  },
} as const

export type Language = keyof typeof translations
export type TranslationKeys = typeof translations.es
