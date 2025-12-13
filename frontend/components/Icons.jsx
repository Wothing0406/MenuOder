// Professional Icons Component using Lucide React
import {
  Menu,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Image as LucideImage,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Grid3x3,
  UtensilsCrossed,
  Upload,
  Settings,
  QrCode,
  Folder,
  Clipboard,
  DollarSign,
  FileText,
  Camera,
  BookOpen,
  Truck,
  Home,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Package,
  Clock,
  Star,
  Heart,
  Share2,
  Download,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Minus,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Save,
  XCircle,
  PlusCircle,
  MinusCircle,
  BarChart3,
  Star as LucideStar,
  Wallet,
  Building2,
  Landmark,
  Sparkles,
  Power,
  PowerOff,
  Target,
} from 'lucide-react';

// Icon wrapper component for consistent styling
export const IconWrapper = ({ children, className = "", size = "default" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
  };

  return (
    <span className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

// Menu & Navigation Icons
export const MenuIcon = ({ className = "w-6 h-6", ...props }) => (
  <Menu className={className} strokeWidth={2} {...props} />
);

export const CartIcon = ({ className = "w-6 h-6", ...props }) => (
  <ShoppingCart className={className} strokeWidth={2} {...props} />
);

// Action Icons
export const PlusIcon = ({ className = "w-5 h-5", ...props }) => (
  <Plus className={className} strokeWidth={2.5} {...props} />
);

export const PlusCircleIcon = ({ className = "w-5 h-5", ...props }) => (
  <PlusCircle className={className} strokeWidth={2.5} {...props} />
);

export const MinusIcon = ({ className = "w-5 h-5", ...props }) => (
  <Minus className={className} strokeWidth={2.5} {...props} />
);

export const MinusCircleIcon = ({ className = "w-5 h-5", ...props }) => (
  <MinusCircle className={className} strokeWidth={2.5} {...props} />
);

export const EditIcon = ({ className = "w-5 h-5", ...props }) => (
  <Edit className={className} strokeWidth={2} {...props} />
);

export const DeleteIcon = ({ className = "w-5 h-5", ...props }) => (
  <Trash2 className={className} strokeWidth={2} {...props} />
);

export const CheckIcon = ({ className = "w-5 h-5", ...props }) => (
  <Check className={className} strokeWidth={3} {...props} />
);

export const CheckCircleIcon = ({ className = "w-5 h-5", ...props }) => (
  <CheckCircle className={className} strokeWidth={2} {...props} />
);

export const CloseIcon = ({ className = "w-6 h-6", ...props }) => (
  <X className={className} strokeWidth={2.5} {...props} />
);

export const XCircleIcon = ({ className = "w-6 h-6", ...props }) => (
  <XCircle className={className} strokeWidth={2} {...props} />
);

// Direction Icons
export const ArrowUpIcon = ({ className = "w-5 h-5", ...props }) => (
  <ChevronUp className={className} strokeWidth={2.5} {...props} />
);

export const ArrowDownIcon = ({ className = "w-5 h-5", ...props }) => (
  <ChevronDown className={className} strokeWidth={2.5} {...props} />
);

export const ArrowRightIcon = ({ className = "w-5 h-5", ...props }) => (
  <ArrowRight className={className} strokeWidth={2} {...props} />
);

export const ArrowLeftIcon = ({ className = "w-5 h-5", ...props }) => (
  <ArrowLeft className={className} strokeWidth={2} {...props} />
);

export const ChevronRightIcon = ({ className = "w-5 h-5", ...props }) => (
  <ChevronRight className={className} strokeWidth={2.5} {...props} />
);

export const ChevronLeftIcon = ({ className = "w-5 h-5", ...props }) => (
  <ChevronLeft className={className} strokeWidth={2.5} {...props} />
);

// Category & Content Icons
export const CategoryIcon = ({ className = "w-6 h-6", ...props }) => (
  <Grid3x3 className={className} strokeWidth={2} {...props} />
);

export const FoodIcon = ({ className = "w-6 h-6", ...props }) => (
  <UtensilsCrossed className={className} strokeWidth={2} {...props} />
);

export const DishIcon = ({ className = "w-6 h-6", ...props }) => (
  <UtensilsCrossed className={className} strokeWidth={2} {...props} />
);

// Media Icons
export const ImageIcon = ({ className = "w-6 h-6", ...props }) => (
  <LucideImage className={className} strokeWidth={2} {...props} />
);

export const UploadIcon = ({ className = "w-5 h-5", ...props }) => (
  <Upload className={className} strokeWidth={2} {...props} />
);

export const CameraIcon = ({ className = "w-6 h-6", ...props }) => (
  <Camera className={className} strokeWidth={2} {...props} />
);

// Settings & Tools Icons
export const SettingsIcon = ({ className = "w-6 h-6", ...props }) => (
  <Settings className={className} strokeWidth={2} {...props} />
);

export const QRIcon = ({ className = "w-6 h-6", ...props }) => (
  <QrCode className={className} strokeWidth={2} {...props} />
);

export const FolderIcon = ({ className = "w-6 h-6", ...props }) => (
  <Folder className={className} strokeWidth={2} {...props} />
);

export const ClipboardIcon = ({ className = "w-6 h-6", ...props }) => (
  <Clipboard className={className} strokeWidth={2} {...props} />
);

// Business Icons
export const MoneyIcon = ({ className = "w-6 h-6", ...props }) => (
  <DollarSign className={className} strokeWidth={2} {...props} />
);

export const NoteIcon = ({ className = "w-6 h-6", ...props }) => (
  <FileText className={className} strokeWidth={2} {...props} />
);

export const DeliveryTruckIcon = ({ className = "w-6 h-6", ...props }) => (
  <Truck className={className} strokeWidth={2} {...props} />
);

export const TableIcon = ({ className = "w-6 h-6", ...props }) => (
  <Home className={className} strokeWidth={2} {...props} />
);

// User & Auth Icons
export const UserIcon = ({ className = "w-6 h-6", ...props }) => (
  <User className={className} strokeWidth={2} {...props} />
);

export const LogOutIcon = ({ className = "w-6 h-6", ...props }) => (
  <LogOut className={className} strokeWidth={2} {...props} />
);

export const LogInIcon = ({ className = "w-6 h-6", ...props }) => (
  <LogIn className={className} strokeWidth={2} {...props} />
);

export const UserPlusIcon = ({ className = "w-6 h-6", ...props }) => (
  <UserPlus className={className} strokeWidth={2} {...props} />
);

// Utility Icons
export const SearchIcon = ({ className = "w-6 h-6", ...props }) => (
  <Search className={className} strokeWidth={2} {...props} />
);

export const PhoneIcon = ({ className = "w-6 h-6", ...props }) => (
  <Phone className={className} strokeWidth={2} {...props} />
);

export const MailIcon = ({ className = "w-6 h-6", ...props }) => (
  <Mail className={className} strokeWidth={2} {...props} />
);

export const MapPinIcon = ({ className = "w-6 h-6", ...props }) => (
  <MapPin className={className} strokeWidth={2} {...props} />
);

export const CreditCardIcon = ({ className = "w-6 h-6", ...props }) => (
  <CreditCard className={className} strokeWidth={2} {...props} />
);

export const PackageIcon = ({ className = "w-6 h-6", ...props }) => (
  <Package className={className} strokeWidth={2} {...props} />
);

export const ClockIcon = ({ className = "w-6 h-6", ...props }) => (
  <Clock className={className} strokeWidth={2} {...props} />
);

export const StarIcon = ({ className = "w-6 h-6", ...props }) => (
  <Star className={className} strokeWidth={2} fill="currentColor" {...props} />
);

export const HeartIcon = ({ className = "w-6 h-6", ...props }) => (
  <Heart className={className} strokeWidth={2} {...props} />
);

export const ShareIcon = ({ className = "w-6 h-6", ...props }) => (
  <Share2 className={className} strokeWidth={2} {...props} />
);

export const DownloadIcon = ({ className = "w-6 h-6", ...props }) => (
  <Download className={className} strokeWidth={2} {...props} />
);

export const EyeIcon = ({ className = "w-6 h-6", ...props }) => (
  <Eye className={className} strokeWidth={2} {...props} />
);

export const EyeOffIcon = ({ className = "w-6 h-6", ...props }) => (
  <EyeOff className={className} strokeWidth={2} {...props} />
);

export const LockIcon = ({ className = "w-6 h-6", ...props }) => (
  <Lock className={className} strokeWidth={2} {...props} />
);

export const UnlockIcon = ({ className = "w-6 h-6", ...props }) => (
  <Unlock className={className} strokeWidth={2} {...props} />
);

// Status Icons
export const AlertCircleIcon = ({ className = "w-6 h-6", ...props }) => (
  <AlertCircle className={className} strokeWidth={2} {...props} />
);

export const InfoIcon = ({ className = "w-6 h-6", ...props }) => (
  <Info className={className} strokeWidth={2} {...props} />
);

// Action Icons
export const FilterIcon = ({ className = "w-6 h-6", ...props }) => (
  <Filter className={className} strokeWidth={2} {...props} />
);

export const SortAscIcon = ({ className = "w-6 h-6", ...props }) => (
  <SortAsc className={className} strokeWidth={2} {...props} />
);

export const SortDescIcon = ({ className = "w-6 h-6", ...props }) => (
  <SortDesc className={className} strokeWidth={2} {...props} />
);

export const RefreshIcon = ({ className = "w-6 h-6", ...props }) => (
  <RefreshCw className={className} strokeWidth={2} {...props} />
);

export const SaveIcon = ({ className = "w-6 h-6", ...props }) => (
  <Save className={className} strokeWidth={2} {...props} />
);

// Chart & Analytics Icons
export const BarChartIcon = ({ className = "w-6 h-6", ...props }) => (
  <BarChart3 className={className} strokeWidth={2} {...props} />
);

// Payment & Finance Icons
export const WalletIcon = ({ className = "w-6 h-6", ...props }) => (
  <Wallet className={className} strokeWidth={2} {...props} />
);

export const BuildingIcon = ({ className = "w-6 h-6", ...props }) => (
  <Building2 className={className} strokeWidth={2} {...props} />
);

export const BankIcon = ({ className = "w-6 h-6", ...props }) => (
  <Landmark className={className} strokeWidth={2} {...props} />
);

export const SparklesIcon = ({ className = "w-6 h-6", ...props }) => (
  <Sparkles className={className} strokeWidth={2} {...props} />
);

export const PowerIcon = ({ className = "w-6 h-6", ...props }) => (
  <Power className={className} strokeWidth={2} {...props} />
);

export const PowerOffIcon = ({ className = "w-6 h-6", ...props }) => (
  <PowerOff className={className} strokeWidth={2} {...props} />
);

export const TargetIcon = ({ className = "w-6 h-6", ...props }) => (
  <Target className={className} strokeWidth={2} {...props} />
);
