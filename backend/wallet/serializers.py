from rest_framework import serializers
from .models import Wallet, Transaction, ActivityType, MultiplierRule

class ActivityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityType
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class MultiplierRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MultiplierRule
        fields = [
            'id', 'name', 'description', 'multiplier', 'condition_type',
            'condition_value', 'is_active', 'start_date', 'end_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class TransactionSerializer(serializers.ModelSerializer):
    activity_type = ActivityTypeSerializer(read_only=True)
    class Meta:
        model = Transaction
        fields = [
            'id', 'student', 'transaction_type', 'activity_type', 'points',
            'multiplier_applied', 'multiplier_rule', 'reference_id',
            'description', 'timestamp', 'created_at'
        ]
        read_only_fields = ['id', 'timestamp', 'created_at']

class WalletSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_number = serializers.CharField(source='student.student_number', read_only=True)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    class Meta:
        model = Wallet
        fields = ['id', 'student', 'student_name', 'student_number', 'balance']
        read_only_fields = ['id', 'balance'] 