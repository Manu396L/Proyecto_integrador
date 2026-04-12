from django import forms
from .models import TicketSoporte


class TicketSoporteForm(forms.ModelForm):
    """Formulario para crear tickets de soporte"""
    
    class Meta:
        model = TicketSoporte
        fields = ['nombre', 'email', 'categoria', 'asunto', 'descripcion']
        widgets = {
            'nombre': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Tu nombre completo'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'tu.email@empresa.com'}),
            'categoria': forms.Select(attrs={'class': 'form-control'}),
            'asunto': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Resumen del problema'}),
            'descripcion': forms.Textarea(attrs={'class': 'form-control', 'rows': 5, 'placeholder': 'Describe el problema detalladamente'}),
        }
